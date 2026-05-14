import React, { useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, message, Tag, Input, Select, Switch, TreeSelect } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MenuOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  parentId?: string;
  sort: number;
  type: 'menu' | 'button';
  permission?: string;
  visible: boolean;
  status: 'active' | 'inactive';
}

const SystemMenu: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<MenuItem | null>(null);
  const [form] = Form.useForm();

  // 模拟数据
  const [dataSource] = useState<MenuItem[]>([
    { id: '1', name: '工作台', path: '/dashboard', icon: 'dashboard', sort: 1, type: 'menu', visible: true, status: 'active' },
    { id: '2', name: '监测与处置', path: '/monitor', icon: 'monitor', sort: 2, type: 'menu', visible: true, status: 'active' },
    { id: '2-1', name: '打卡核验', path: '/monitor/attendance', icon: 'check-circle', parentId: '2', sort: 1, type: 'menu', permission: 'monitor:attendance', visible: true, status: 'active' },
    { id: '2-2', name: '预警处置', path: '/monitor/alert', icon: 'warning', parentId: '2', sort: 2, type: 'menu', permission: 'monitor:alert', visible: true, status: 'active' },
    { id: '3', name: '申请与审批', path: '/approval', icon: 'file-text', sort: 3, type: 'menu', visible: true, status: 'active' },
    { id: '3-1', name: '材料审批', path: '/approval/material', icon: 'file-image', parentId: '3', sort: 1, type: 'menu', permission: 'approval:material', visible: true, status: 'active' },
    { id: '3-2', name: '请假管理', path: '/approval/leave', icon: 'calendar', parentId: '3', sort: 2, type: 'menu', permission: 'approval:leave', visible: true, status: 'active' },
    { id: '3-3', name: '备案管理', path: '/approval/filing', icon: 'environment', parentId: '3', sort: 3, type: 'menu', permission: 'approval:filing', visible: true, status: 'active' },
    { id: '4', name: '分析与报表', path: '/report', icon: 'bar-chart', sort: 4, type: 'menu', visible: true, status: 'active' },
    { id: '5', name: '系统与运维', path: '/system', icon: 'setting', sort: 5, type: 'menu', visible: true, status: 'active' },
    { id: '5-1', name: '人员管理', path: '/system/personnel', icon: 'team', parentId: '5', sort: 1, type: 'menu', permission: 'system:personnel', visible: true, status: 'active' },
    { id: '5-2', name: '角色管理', path: '/system/role', icon: 'user', parentId: '5', sort: 2, type: 'menu', permission: 'system:role', visible: true, status: 'active' },
  ]);

  const typeConfig = {
    menu: { text: '菜单', color: 'blue' },
    button: { text: '按钮', color: 'green' },
  };

  const statusConfig = {
    active: { text: '启用', color: 'green' },
    inactive: { text: '停用', color: 'red' },
  };

  const columns: ColumnsType<MenuItem> = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <Space>
          {record.icon && <span style={{ fontSize: 16 }}>📁</span>}
          <span style={{ paddingLeft: record.parentId ? 20 : 0 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      width: 200,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      width: 120,
      render: (text) => text ? <Tag>{text}</Tag> : '-',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: keyof typeof typeConfig) => (
        <Tag color={typeConfig[type].color}>{typeConfig[type].text}</Tag>
      ),
    },
    {
      title: '权限标识',
      dataIndex: 'permission',
      key: 'permission',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
      align: 'center',
    },
    {
      title: '可见',
      dataIndex: 'visible',
      key: 'visible',
      width: 80,
      align: 'center',
      render: (visible) => (
        <Tag color={visible ? 'green' : 'red'}>{visible ? '是' : '否'}</Tag>
      ),
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
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<ArrowUpOutlined />}
            title="上移"
          />
          <Button
            type="link"
            size="small"
            icon={<ArrowDownOutlined />}
            title="下移"
          />
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

  const handleEdit = (record: MenuItem) => {
    setEditMode(true);
    setCurrentRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (record: MenuItem) => {
    Modal.confirm({
      title: '删除菜单',
      content: `确定要删除菜单 ${record.name} 吗？`,
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

  // 构建树形数据供父级菜单选择
  const menuTreeData = dataSource
    .filter((item) => !item.parentId)
    .map((item) => ({
      title: item.name,
      value: item.id,
      children: dataSource
        .filter((child) => child.parentId === item.id)
        .map((child) => ({
          title: child.name,
          value: child.id,
        })),
    }));

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 操作按钮 */}
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增菜单
            </Button>
            <Button icon={<MenuOutlined />}>展开/收起</Button>
          </Space>

          {/* 表格 */}
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 1400 }}
          />
        </Space>
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editMode ? '编辑菜单' : '新增菜单'}
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
            label="菜单名称"
            rules={[{ required: true, message: '请输入菜单名称' }]}
          >
            <Input placeholder="请输入菜单名称" />
          </Form.Item>
          <Form.Item name="parentId" label="上级菜单">
            <TreeSelect
              placeholder="请选择上级菜单（不选则为顶级菜单）"
              allowClear
              treeData={menuTreeData}
            />
          </Form.Item>
          <Form.Item
            name="path"
            label="路由路径"
            rules={[{ required: true, message: '请输入路由路径' }]}
          >
            <Input placeholder="如：/system/menu" />
          </Form.Item>
          <Form.Item name="icon" label="图标">
            <Input placeholder="如：menu, setting" />
          </Form.Item>
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
            initialValue="menu"
          >
            <Select>
              <Option value="menu">菜单</Option>
              <Option value="button">按钮</Option>
            </Select>
          </Form.Item>
          <Form.Item name="permission" label="权限标识">
            <Input placeholder="如：system:menu:view" />
          </Form.Item>
          <Form.Item
            name="sort"
            label="排序"
            rules={[{ required: true, message: '请输入排序号' }]}
            initialValue={1}
          >
            <Input type="number" placeholder="数字越小越靠前" />
          </Form.Item>
          <Form.Item name="visible" label="是否可见" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemMenu;
