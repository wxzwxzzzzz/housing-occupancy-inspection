import React from 'react';
import { Avatar, message, Modal, Skeleton, Tag } from 'antd';
import {
  DeleteOutlined,
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from '@umijs/max';
import { userService } from '@/services/domains/arche';
import { authService } from '@/services/domains/auth';
import type { User } from '@/types/ontology/ap/arche/user';
import {
  OmnibarDetailPage,
  useDetail,
  type DetailSection,
  type DetailTabItem,
  type StatusBadge,
  type ToolbarAction,
} from '@/components/OmnibarPage';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: '系统管理员',
  APPROVER: '审批员',
  STAFF: '工作人员',
  RESIDENT: '居民',
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: '正常',
  INACTIVE: '停用',
  LOCKED: '已锁定',
};

function getStatusBadge(status: string | undefined): StatusBadge {
  const map: Record<string, StatusBadge['color']> = {
    ACTIVE: 'success',
    INACTIVE: 'secondary',
    LOCKED: 'danger',
  };
  return {
    text: STATUS_LABEL[status ?? ''] ?? status ?? '-',
    color: map[status ?? ''] ?? 'secondary',
  };
}

const PersonnelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fetcher = React.useCallback(async (uid: string) => {
    const env = await userService.detail(uid);
    return env.data as User;
  }, []);
  const { data, loading, reload } = useDetail<User>(id, fetcher);

  if (loading || !data) {
    return (
      <div style={{ padding: 16 }}>
        <Skeleton active />
      </div>
    );
  }

  const r = data as any;

  const sections: DetailSection[] = [
    {
      key: 'base',
      title: '基础信息',
      fields: [
        { label: '账号', value: r.account ?? '-', name: 'account', editType: 'input' },
        { label: '姓名', value: r.fullName ?? '-', name: 'fullName', editType: 'input', required: true },
        { label: '手机', value: r.phone ?? '-', name: 'phone', editType: 'input' },
        { label: '邮箱', value: r.email ?? '-', name: 'email', editType: 'input' },
        {
          label: '用户类型',
          value: <Tag color="blue">{ROLE_LABEL[r.userType] ?? r.userType ?? '-'}</Tag>,
          name: 'userType',
          editType: 'select',
          options: Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label })),
        },
      ],
    },
    {
      key: 'security',
      title: '安全与登录',
      defaultCollapsed: true,
      fields: [
        {
          label: '状态',
          value: (
            <Tag>{STATUS_LABEL[r.status] ?? r.status ?? '-'}</Tag>
          ),
          name: 'status',
          editType: 'select',
          options: Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
        },
        {
          label: '最近登录',
          value: r.lastSignInAt ? new Date(r.lastSignInAt).toLocaleString() : '-',
        },
        { label: '匿名账户', value: r.isAnonymous ? '是' : '否' },
        { label: 'SSO 用户', value: r.isSSOUser ? '是' : '否' },
      ],
    },
  ];

  const tabs: DetailTabItem[] = [
    {
      key: 'detail',
      label: '账户详情',
      content: <div style={{ padding: 16, color: '#595959' }}>该账户的更多详情将在此显示</div>,
    },
  ];

  const handleLock = () =>
    Modal.confirm({
      title: '锁定账户',
      content: `确定锁定 ${r.account}?`,
      onOk: async () => {
        await authService.lockAccount(r.id);
        message.success('已锁定');
        reload();
      },
    });

  const handleDelete = () =>
    Modal.confirm({
      title: '删除人员',
      content: `确定删除 ${r.account}?`,
      okType: 'danger',
      onOk: async () => {
        await userService.delete(r.id);
        message.success('已删除');
        navigate('/system/personnel');
      },
    });

  const headerActions: ToolbarAction[] = [
    { key: 'lock', label: '锁定', icon: <LockOutlined />, onClick: handleLock },
    { divider: true },
    { key: 'delete', label: '删除', danger: true, icon: <DeleteOutlined />, onClick: handleDelete },
  ];

  return (
    <div style={{ padding: 16, height: 'calc(100vh - 64px - 45px)' }}>
      <OmnibarDetailPage
        title={
          <span>
            <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }}>
              {r.fullName?.[0] ?? r.account?.[0]}
            </Avatar>
            {r.fullName ?? r.account}
            <span style={{ marginLeft: 8, color: '#8c8c8c', fontSize: 13 }}>{r.account}</span>
          </span>
        }
        statusBadge={getStatusBadge(r.status)}
        onBack={() => navigate('/system/personnel')}
        headerActions={headerActions}
        sections={sections}
        tabs={tabs}
        footerFields={[
          { label: '创建人', value: r.creator ?? '-' },
          { label: '创建时间', value: r.createAt ? new Date(r.createAt).toLocaleString() : '-' },
          { label: '修改人', value: r.modifier ?? '-' },
          { label: '修改时间', value: r.modifyAt ? new Date(r.modifyAt).toLocaleString() : '-' },
        ]}
        editable
        record={r}
        onSave={async (values) => {
          await userService.modify({ ...r, ...values });
        }}
        onSaved={reload}
      />
    </div>
  );
};

export default PersonnelDetail;
