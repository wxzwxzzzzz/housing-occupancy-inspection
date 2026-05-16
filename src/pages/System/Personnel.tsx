import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Descriptions,
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
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { userService } from '@/services/domains/arche';
import { authService } from '@/services/domains/auth';
import { qb } from '@/services/ontology/query';
import { OT } from '@/services/ontology/object-types';
import type { User } from '@/types/ontology/ap/arche/user';
import MasterDetailListPage from '@/components/MasterDetailListPage';

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
  const [searchForm] = Form.useForm<{ keyword?: string; roleFilter?: string }>();
  const [filters, setFilters] = useState<{ keyword?: string; roleFilter?: string }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const buildQuery = useMemo(
    () => () => {
      const builder = qb(OT.User).orderBy('createAt', 'DESC');
      if (filters.keyword) builder.like('account', filters.keyword);
      if (filters.roleFilter) builder.eq('userType', filters.roleFilter);
      return builder.build();
    },
    [filters],
  );

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 'ACTIVE', userType: 'STAFF' });
    setModalOpen(true);
  };

  const handleEdit = (record: User) => {
    setEditing(record);
    form.setFieldsValue({
      account: record.account,
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
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: '账号',
      dataIndex: 'account',
      width: 150,
      render: (text: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <span>{text}</span>
        </Space>
      ),
    },
    { title: '姓名', dataIndex: 'fullName', width: 110 },
    {
      title: '类型',
      dataIndex: 'userType',
      width: 100,
      render: (v: string) => (
        <Tag color="blue">{ROLE_OPTIONS.find((r) => r.value === v)?.label ?? v}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v: string) => (
        <Tag color={STATUS_COLOR[v] ?? 'default'}>{STATUS_LABEL[v] ?? v}</Tag>
      ),
    },
  ];

  return (
    <>
      <MasterDetailListPage<User>
        title="人员管理"
        service={userService as any}
        buildQuery={buildQuery}
        columns={columns}
        storageKey="system-personnel"
        rowContextMenuItems={(record, ctx) => [
          {
            key: 'edit',
            label: '编辑',
            onClick: () => handleEdit(record),
          },
          {
            key: 'lock',
            label: '锁定账户',
            onClick: () =>
              Modal.confirm({
                title: '锁定账户',
                content: `确定锁定 ${(record as any).account}?`,
                onOk: async () => {
                  await authService.lockAccount((record as any).id);
                  message.success('已锁定');
                  ctx.reload();
                },
              }),
          },
          { type: 'divider' },
          {
            key: 'delete',
            label: '删除',
            danger: true,
            onClick: () =>
              Modal.confirm({
                title: '删除人员',
                content: `确定删除 ${(record as any).account}?`,
                okType: 'danger',
                onOk: async () => {
                  await userService.delete((record as any).id);
                  message.success('已删除');
                  ctx.reload();
                },
              }),
          },
        ]}
        toolbar={
          <Form
            form={searchForm}
            layout="inline"
            onFinish={(v) => setFilters(v)}
          >
            <Form.Item name="keyword">
              <Input
                placeholder="账号关键字"
                prefix={<SearchOutlined />}
                style={{ width: 180 }}
                allowClear
              />
            </Form.Item>
            <Form.Item name="roleFilter">
              <Select
                placeholder="用户类型"
                style={{ width: 130 }}
                allowClear
                options={ROLE_OPTIONS}
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  查询
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                  新增
                </Button>
              </Space>
            </Form.Item>
          </Form>
        }
        renderDetailHeader={(record) => (
          <Space>
            <Avatar size={36} icon={<UserOutlined />}>
              {(record as any).fullName?.[0]}
            </Avatar>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {(record as any).fullName ?? (record as any).account}
              </div>
              <div style={{ color: '#8c8c8c', fontSize: 12 }}>
                {(record as any).account}
              </div>
            </div>
          </Space>
        )}
        renderDetail={(record) => (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="账号">{(record as any).account}</Descriptions.Item>
            <Descriptions.Item label="姓名">{(record as any).fullName ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="手机">{(record as any).phone ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{(record as any).email ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="用户类型">
              <Tag color="blue">
                {ROLE_OPTIONS.find((r) => r.value === (record as any).userType)?.label ??
                  (record as any).userType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={STATUS_COLOR[(record as any).status] ?? 'default'}>
                {STATUS_LABEL[(record as any).status] ?? (record as any).status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="最近登录">
              {(record as any).lastSignInAt
                ? new Date((record as any).lastSignInAt).toLocaleString()
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {(record as any).createAt
                ? new Date((record as any).createAt).toLocaleString()
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
        renderDetailActions={(record, ctx) => (
          <>
            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Button
              icon={<LockOutlined />}
              onClick={() =>
                Modal.confirm({
                  title: '锁定账户',
                  content: `确定锁定 ${(record as any).account}?`,
                  onOk: async () => {
                    await authService.lockAccount((record as any).id);
                    message.success('已锁定');
                    ctx.reload();
                  },
                })
              }
            >
              锁定
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() =>
                Modal.confirm({
                  title: '删除人员',
                  content: `确定删除 ${(record as any).account}?`,
                  okType: 'danger',
                  onOk: async () => {
                    await userService.delete((record as any).id);
                    message.success('已删除');
                    ctx.selectNext();
                    ctx.reload();
                  },
                })
              }
            >
              删除
            </Button>
          </>
        )}
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
          <Form.Item
            name="fullName"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="account"
            label="账号"
            rules={[{ required: true, message: '请输入账号' }]}
          >
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
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '邮箱格式不正确' }]}
          >
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
    </>
  );
};

export default SystemPersonnel;
