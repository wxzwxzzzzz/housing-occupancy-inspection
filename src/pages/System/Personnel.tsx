import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Table,
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
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  async function load(page = pageNo, size = pageSize) {
    setLoading(true);
    try {
      const builder = qb(OT.User).orderBy('createAt', 'DESC').page(page, size);
      if (keyword) builder.like('account', keyword);
      if (roleFilter) builder.eq('userType', roleFilter);
      const env = await userService.list(builder.build());
      setData(env.data);
      setTotal(env.page?.total ?? env.data.length);
    } finally {
      setLoading(false);
    }
  }

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
        await userService.add({ ...values, isAnonymous: false, isSSOUser: false, emailChangeStatus: 'NONE' } as any);
        message.success('新增成功');
      }
      setModalOpen(false);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (record: User) => {
    Modal.confirm({
      title: '删除人员',
      content: `确定删除 ${(record as any).account}?`,
      okType: 'danger',
      onOk: async () => {
        await userService.delete((record as any).id);
        message.success('已删除');
        load();
      },
    });
  };

  const handleLock = (record: User) => {
    Modal.confirm({
      title: '锁定账户',
      content: `确定锁定 ${(record as any).account}?`,
      onOk: async () => {
        await authService.lockAccount((record as any).id);
        message.success('已锁定');
        load();
      },
    });
  };

  const columns: ColumnsType<User> = [
    {
      title: '账号',
      dataIndex: 'account',
      width: 140,
      render: (text: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <span>{text}</span>
        </Space>
      ),
    },
    { title: '姓名', dataIndex: 'fullName', width: 120 },
    { title: '手机', dataIndex: 'phone', width: 130 },
    { title: '邮箱', dataIndex: 'email', width: 200, ellipsis: true },
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
      render: (v: string) => <Tag color={STATUS_COLOR[v] ?? 'default'}>{STATUS_LABEL[v] ?? v}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createAt',
      width: 200,
      render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
    },
    {
      title: '操作',
      key: 'op',
      width: 280,
      fixed: 'right',
      render: (_, record: User) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<LockOutlined />} onClick={() => handleLock(record)}>
            锁定
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space wrap>
            <Input
              placeholder="账号关键字"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              onPressEnter={() => load(1, pageSize)}
            />
            <Select
              placeholder="用户类型"
              style={{ width: 150 }}
              allowClear
              value={roleFilter}
              onChange={(v) => setRoleFilter(v)}
              options={ROLE_OPTIONS}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={() => load(1, pageSize)}>
              搜索
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增人员
            </Button>
          </Space>

          <Table<User>
            rowKey={(r) => (r as any).id}
            columns={columns}
            dataSource={data}
            loading={loading}
            scroll={{ x: 1400 }}
            pagination={{
              current: pageNo,
              pageSize,
              total,
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (p, s) => {
                setPageNo(p);
                setPageSize(s);
                load(p, s);
              },
            }}
          />
        </Space>
      </Card>

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
          <Form.Item name="status" label="状态" valuePropName="value">
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
