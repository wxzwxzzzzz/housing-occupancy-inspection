import React, { useCallback, useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Tag,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';
import { userService } from '@/services/domains/arche';
import { authService } from '@/services/domains/auth';
import { qb } from '@/services/ontology/query';
import { OT } from '@/services/ontology/object-types';
import type { User } from '@/types/ontology/ap/arche/user';
import {
  OmnibarListPage,
  type FilterConfig,
  type ToolbarAction,
} from '@/components/OmnibarPage';

const ROLE_OPTIONS = [
  { label: '系统管理员', value: 'ADMIN' },
  { label: '审批员', value: 'APPROVER' },
  { label: '工作人员', value: 'STAFF' },
  { label: '居民', value: 'RESIDENT' },
];

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: '正常',
  INACTIVE: '停用',
  LOCKED: '已锁定',
};
const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'green',
  INACTIVE: 'default',
  LOCKED: 'red',
};

const SystemPersonnel: React.FC = () => {
  const navigate = useNavigate();
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(
    async (p = page, s = pageSize, override?: Record<string, any>) => {
      setLoading(true);
      try {
        const v = override ?? filterValues;
        const builder = qb(OT.User).orderBy('createAt', 'DESC').page(p, s);
        if (v.keyword) builder.like('account', v.keyword);
        if (v.userType) builder.eq('userType', v.userType);
        const env = await userService.list(builder.build() as any);
        setData(env.data);
        setTotal(env.page?.total ?? env.data.length);
      } finally {
        setLoading(false);
      }
    },
    [filterValues, page, pageSize],
  );

  useEffect(() => {
    load(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 'ACTIVE', userType: 'STAFF' });
    setModalOpen(true);
  };

  const handleEdit = (record: User) => {
    setEditing(record);
    form.setFieldsValue({
      account: (record as any).account,
      fullName: (record as any).fullName,
      phone: (record as any).phone,
      email: (record as any).email,
      userType: (record as any).userType,
      status: (record as any).status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editing) {
        await userService.modify({ ...values, id: (editing as any).id });
        message.success('编辑成功');
      } else {
        await userService.add({
          ...values,
          isAnonymous: false,
          isSSOUser: false,
          emailChangeStatus: 'NONE',
        } as any);
        message.success('新增成功');
      }
      setModalOpen(false);
      load(1, pageSize);
    } finally {
      setSubmitting(false);
    }
  };

  const filters: FilterConfig[] = [
    { key: 'keyword', label: '账号', type: 'input', placeholder: '账号关键字' },
    {
      key: 'userType',
      label: '用户类型',
      type: 'quick',
      options: [
        { value: '', label: '全部' },
        ...ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label })),
      ],
    },
  ];

  const toolbarActions: ToolbarAction[] = [
    { key: 'add', label: '新增', type: 'primary', icon: <PlusOutlined />, onClick: handleAdd },
  ];

  const columns: ColumnsType<User> = [
    {
      title: '账号',
      dataIndex: 'account',
      width: 180,
      render: (text: string, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <span
            className="opp-link-cell"
            onClick={() => navigate(`/system/personnel/detail/${record.id}`)}
          >
            {text}
          </span>
        </Space>
      ),
    },
    { title: '姓名', dataIndex: 'fullName', width: 110 },
    { title: '手机', dataIndex: 'phone', width: 130 },
    {
      title: '类型',
      dataIndex: 'userType',
      width: 110,
      render: (v: string) => (
        <Tag color="blue">{ROLE_OPTIONS.find((r) => r.value === v)?.label ?? v}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: string) => (
        <Tag color={STATUS_COLOR[v] ?? 'default'}>{STATUS_LABEL[v] ?? v}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_: any, record: any) => (
        <span className="opp-row-actions">
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/system/personnel/detail/${record.id}`);
            }}
          >
            查看
          </span>
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          >
            <EditOutlined /> 编辑
          </span>
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
              Modal.confirm({
                title: '锁定账户',
                content: `确定锁定 ${record.account}?`,
                onOk: async () => {
                  await authService.lockAccount(record.id);
                  message.success('已锁定');
                  load();
                },
              });
            }}
          >
            <LockOutlined /> 锁定
          </span>
          <span
            className="opp-row-action danger"
            onClick={(e) => {
              e.stopPropagation();
              Modal.confirm({
                title: '删除人员',
                content: `确定删除 ${record.account}?`,
                okType: 'danger',
                onOk: async () => {
                  await userService.delete(record.id);
                  message.success('已删除');
                  load();
                },
              });
            }}
          >
            <DeleteOutlined /> 删除
          </span>
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: 16, height: 'calc(100vh - 64px - 45px)' }}>
      <OmnibarListPage<User>
        filters={filters}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        onSearch={() => load(1, pageSize)}
        toolbarActions={toolbarActions}
        data={data}
        columns={columns}
        loading={loading}
        rowKey="id"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        showCheckbox
        showIndex
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={(p, s) => {
          setPage(p);
          setPageSize(s);
          load(p, s);
        }}
      />

      <Modal
        title={editing ? '编辑人员' : '新增人员'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={submitting}
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="fullName" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="account" label="账号" rules={[{ required: true, message: '请输入账号' }]}>
            <Input placeholder="请输入登录账号" disabled={!!editing} />
          </Form.Item>
          {!editing && (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[{ required: true, message: '请输入初始密码' }]}
            >
              <Input.Password placeholder="请输入初始密码" />
            </Form.Item>
          )}
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]}
          >
            <Input placeholder="可选" maxLength={11} />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '邮箱格式不正确' }]}>
            <Input placeholder="可选" />
          </Form.Item>
          <Form.Item name="userType" label="用户类型" rules={[{ required: true }]}>
            <Select options={ROLE_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              options={[
                { label: '正常', value: 'ACTIVE' },
                { label: '停用', value: 'INACTIVE' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemPersonnel;
