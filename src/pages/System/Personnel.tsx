import React, { useState } from 'react';
import { Card, Table, Button, Space, Input, Select, Modal, Form, message, Tag, Switch, Avatar } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

interface PersonnelItem {
  id: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  createTime: string;
}

const SystemPersonnel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<PersonnelItem | null>(null);
  const [form] = Form.useForm();

  // 模拟数据
  const [dataSource] = useState<PersonnelItem[]>([
    {
      id: '1',
      name: '张管理',
      username: 'admin',
      phone: '138****1234',
      email: 'admin@example.com',
      role: '系统管理员',
      department: '技术部',
      status: 'active',
      createTime: '2025-01-01 10:00:00',
    },
    {
      id: '2',
      name: '李审批',
      username: 'approver1',
      phone: '139****5678',
      email: 'approver1@example.com',
      role: '审批员',
      department: '业务部',
      status: 'active',
      createTime: '2025-02-15 14:30:00',
    },
    {
      id: '3',
      name: '王监测',
      username: 'monitor1',
      phone: '137****9012',
      email: 'monitor1@example.com',
      role: '监测员',
      department: '监管部',
      status: 'active',
      createTime: '2025-03-10 09:20:00',
    },
    {
      id: '4',
      name: '赵离职',
      username: 'old_user',
      phone: '136****3456',
      email: 'old@example.com',
      role: '审批员',
      department: '业务部',
      status: 'inactive',
      createTime: '2024-08-20 11:00:00',
    },
  ]);

  const statusConfig = {
    active: { text: '正常', color: 'green' },
    inactive: { text: '停用', color: 'red' },
  };

  const columns: ColumnsType<PersonnelItem> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: keyof typeof statusConfig) => (
        <Tag color={statusConfig[status].color}>{statusConfig[status].text}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<LockOutlined />}
            onClick={() => handleResetPassword(record)}
          >
            重置密码
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditMode(false);
    setCurrentRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: PersonnelItem) => {
    setEditMode(true);
    setCurrentRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleResetPassword = (record: PersonnelItem) => {
    Modal.confirm({
      title: '重置密码',
      content: `确定要重置 ${record.name} 的密码吗？密码将重置为默认密码。`,
      onOk: async () => {
        setLoading(true);
        try {
          // TODO: 调用重置密码 API
          await new Promise((resolve) => setTimeout(resolve, 500));
          message.success('密码重置成功，默认密码已发送至手机');
        } catch (error) {
          message.error('密码重置失败');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDelete = (record: PersonnelItem) => {
    Modal.confirm({
      title: '删除人员',
      content: `确定要删除 ${record.name} 吗？此操作不可恢复。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true);
        try {
          // TODO: 调用删除 API
          await new Promise((resolve) => setTimeout(resolve, 500));
          message.success('删除成功');
        } catch (error) {
          message.error('删除失败');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // TODO: 调用新增/编辑 API
      await new Promise((resolve) => setTimeout(resolve, 500));

      message.success(editMode ? '编辑成功' : '新增成功');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 搜索筛选 */}
          <Space wrap>
            <Input
              placeholder="搜索姓名或用户名"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="选择角色" style={{ width: 150 }} allowClear>
              <Option value="admin">系统管理员</Option>
              <Option value="approver">审批员</Option>
              <Option value="monitor">监测员</Option>
            </Select>
            <Select placeholder="选择部门" style={{ width: 150 }} allowClear>
              <Option value="tech">技术部</Option>
              <Option value="business">业务部</Option>
              <Option value="supervision">监管部</Option>
            </Select>
            <Select placeholder="状态" style={{ width: 120 }} allowClear>
              <Option value="active">正常</Option>
              <Option value="inactive">停用</Option>
            </Select>
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增人员
            </Button>
          </Space>

          {/* 表格 */}
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1400 }}
            pagination={{
              total: dataSource.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Space>
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editMode ? '编辑人员' : '新增人员'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={editMode} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
            ]}
          >
            <Input placeholder="请输入手机号" maxLength={11} />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="系统管理员">系统管理员</Option>
              <Option value="审批员">审批员</Option>
              <Option value="监测员">监测员</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="department"
            label="部门"
            rules={[{ required: true, message: '请选择部门' }]}
          >
            <Select placeholder="请选择部门">
              <Option value="技术部">技术部</Option>
              <Option value="业务部">业务部</Option>
              <Option value="监管部">监管部</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="正常" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemPersonnel;
