import React, { useState } from 'react';
import { Card, Table, Button, Space, Input, Modal, Form, message, Tag, Tree, Divider } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SafetyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';

interface RoleItem {
  id: string;
  name: string;
  code: string;
  description: string;
  userCount: number;
  permissions: string[];
  status: 'active' | 'inactive';
  createTime: string;
}

const SystemRole: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<RoleItem | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();

  // 模拟数据
  const [dataSource] = useState<RoleItem[]>([
    {
      id: '1',
      name: '系统管理员',
      code: 'admin',
      description: '系统最高权限，可管理所有功能',
      userCount: 3,
      permissions: ['dashboard', 'monitor', 'approval', 'report', 'system'],
      status: 'active',
      createTime: '2025-01-01 00:00:00',
    },
    {
      id: '2',
      name: '审批员',
      code: 'approver',
      description: '负责审批材料、请假、备案等申请',
      userCount: 15,
      permissions: ['dashboard', 'approval', 'report'],
      status: 'active',
      createTime: '2025-01-01 00:00:00',
    },
    {
      id: '3',
      name: '监测员',
      code: 'monitor',
      description: '负责打卡核验、预警处置',
      userCount: 8,
      permissions: ['dashboard', 'monitor', 'report'],
      status: 'active',
      createTime: '2025-01-01 00:00:00',
    },
    {
      id: '4',
      name: '只读用户',
      code: 'viewer',
      description: '只能查看数据，无操作权限',
      userCount: 5,
      permissions: ['dashboard', 'report'],
      status: 'active',
      createTime: '2025-02-15 10:00:00',
    },
  ]);

  // 权限树数据
  const permissionTreeData: DataNode[] = [
    {
      title: '工作台',
      key: 'dashboard',
      children: [
        { title: '查看工作台', key: 'dashboard:view' },
      ],
    },
    {
      title: '监测与处置',
      key: 'monitor',
      children: [
        { title: '打卡核验', key: 'monitor:attendance' },
        { title: '预警处置', key: 'monitor:alert' },
        { title: '预警详情', key: 'monitor:alert:detail' },
      ],
    },
    {
      title: '申请与审批',
      key: 'approval',
      children: [
        { title: '材料审批', key: 'approval:material' },
        { title: '请假管理', key: 'approval:leave' },
        { title: '备案管理', key: 'approval:filing' },
        { title: '审批通过', key: 'approval:approve' },
        { title: '审批拒绝', key: 'approval:reject' },
      ],
    },
    {
      title: '分析与报表',
      key: 'report',
      children: [
        { title: '数据统计', key: 'report:statistics' },
        { title: '报表导出', key: 'report:export' },
      ],
    },
    {
      title: '系统与运维',
      key: 'system',
      children: [
        { title: '消息中心', key: 'system:message' },
        { title: '人员管理', key: 'system:personnel' },
        { title: '角色管理', key: 'system:role' },
        { title: '菜单配置', key: 'system:menu' },
        { title: '系统配置', key: 'system:config' },
        { title: '日志审计', key: 'system:log' },
      ],
    },
  ];

  const statusConfig = {
    active: { text: '启用', color: 'green' },
    inactive: { text: '停用', color: 'red' },
  };

  const columns: ColumnsType<RoleItem> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text) => (
        <Space>
          <SafetyOutlined style={{ color: '#1890ff' }} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '用户数',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      render: (count) => <Tag color="blue">{count} 人</Tag>,
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
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleViewPermission(record)}
          >
            查看权限
          </Button>
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
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            disabled={record.code === 'admin'}
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
    setCheckedKeys([]);
    setModalVisible(true);
  };

  const handleEdit = (record: RoleItem) => {
    setEditMode(true);
    setCurrentRecord(record);
    form.setFieldsValue(record);
    setCheckedKeys(record.permissions);
    setModalVisible(true);
  };

  const handleViewPermission = (record: RoleItem) => {
    setCurrentRecord(record);
    setCheckedKeys(record.permissions);
    setPermissionModalVisible(true);
  };

  const handleDelete = (record: RoleItem) => {
    Modal.confirm({
      title: '删除角色',
      content: `确定要删除角色 ${record.name} 吗？此操作不可恢复。`,
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

      // TODO: 调用新增/编辑 API，包含权限
      console.log({ ...values, permissions: checkedKeys });
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
              placeholder="搜索角色名称"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增角色
            </Button>
          </Space>

          {/* 表格 */}
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1200 }}
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
        title={editMode ? '编辑角色' : '新增角色'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="角色编码"
            rules={[
              { required: true, message: '请输入角色编码' },
              { pattern: /^[a-z_]+$/, message: '只能包含小写字母和下划线' },
            ]}
          >
            <Input placeholder="请输入角色编码" disabled={editMode} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入角色描述" />
          </Form.Item>
          <Divider />
          <Form.Item label="权限配置">
            <Tree
              checkable
              defaultExpandAll
              checkedKeys={checkedKeys}
              onCheck={(checked) => setCheckedKeys(checked as React.Key[])}
              treeData={permissionTreeData}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看权限弹窗 */}
      <Modal
        title={`角色权限 - ${currentRecord?.name}`}
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPermissionModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        <Tree
          checkable
          disabled
          defaultExpandAll
          checkedKeys={checkedKeys}
          treeData={permissionTreeData}
        />
      </Modal>
    </div>
  );
};

export default SystemRole;
