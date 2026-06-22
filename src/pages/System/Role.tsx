import {
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Divider, Form, Input, Modal, message, Tag, Tree } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import React, { useEffect, useState } from 'react';
import {
  type FilterConfig,
  OmnibarListPage,
  type ToolbarAction,
} from '@/components/OmnibarPage';
import { roleService } from '@/services/domains/rbac';
import type { Role } from '@/types/ontology/prh/entities/role';

type RoleItem = Role & { id: string };

const permissionTreeData: DataNode[] = [
  {
    title: '工作台',
    key: 'dashboard',
    children: [{ title: '查看工作台', key: 'dashboard:view' }],
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

const SystemRole: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<RoleItem | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();

  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const [dataSource, setDataSource] = useState<RoleItem[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const env = await roleService.list({
        page: { pageNo: 1, pageSize: 1000 },
      });
      setDataSource(env.data as RoleItem[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = dataSource.filter((r) => {
    if (filterValues.keyword) {
      const kw = String(filterValues.keyword).toLowerCase();
      if (
        !r.name.toLowerCase().includes(kw) &&
        !r.code.toLowerCase().includes(kw)
      )
        return false;
    }
    if (filterValues.status && r.status !== filterValues.status) return false;
    return true;
  });
  const start = (page - 1) * pageSize;
  const pageList = filtered.slice(start, start + pageSize);

  const statusConfig: Record<string, { text: string; color: string }> = {
    active: { text: '启用', color: 'green' },
    inactive: { text: '停用', color: 'red' },
  };

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
    setCheckedKeys(record.permissions ?? []);
    setModalVisible(true);
  };

  const handleViewPermission = (record: RoleItem) => {
    setCurrentRecord(record);
    setCheckedKeys(record.permissions ?? []);
    setPermissionModalVisible(true);
  };

  const handleDelete = (record: RoleItem) => {
    Modal.confirm({
      title: '删除角色',
      content: `确定要删除角色 ${record.name} 吗?此操作不可恢复。`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        await roleService.delete(record.id);
        message.success('删除成功');
        load();
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editMode && currentRecord) {
        await roleService.modify({
          id: currentRecord.id,
          ...values,
          permissions: checkedKeys as string[],
        });
      } else {
        await roleService.add({
          ...values,
          permissions: checkedKeys as string[],
          userCount: 0,
          status: 'active',
          createTime: new Date().toLocaleString(),
        });
      }
      message.success(editMode ? '编辑成功' : '新增成功');
      setModalVisible(false);
      form.resetFields();
      load();
    } catch {
      // 表单验证失败
    } finally {
      setLoading(false);
    }
  };

  const filterConfigs: FilterConfig[] = [
    {
      key: 'keyword',
      label: '关键字',
      type: 'input',
      placeholder: '名称 / 编码',
    },
    {
      key: 'status',
      label: '状态',
      type: 'quick',
      options: [
        { value: '', label: '全部' },
        { value: 'active', label: '启用' },
        { value: 'inactive', label: '停用' },
      ],
    },
  ];

  const toolbarActions: ToolbarAction[] = [
    {
      key: 'add',
      label: '新增',
      type: 'primary',
      icon: <PlusOutlined />,
      onClick: handleAdd,
    },
  ];

  const columns: ColumnsType<RoleItem> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      width: 160,
      render: (text, record) => (
        <span className="opp-link-cell" onClick={() => handleEdit(record)}>
          {text}
        </span>
      ),
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      width: 120,
      render: (text) => <Tag>{text}</Tag>,
    },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    {
      title: '用户数',
      dataIndex: 'userCount',
      width: 100,
      render: (count) => <Tag color="blue">{count} 人</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusConfig[status]?.color}>
          {statusConfig[status]?.text}
        </Tag>
      ),
    },
    { title: '创建时间', dataIndex: 'createTime', width: 160 },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <span className="opp-row-actions">
          <span
            className="opp-row-action"
            onClick={() => handleViewPermission(record)}
          >
            权限
          </span>
          <span className="opp-row-action" onClick={() => handleEdit(record)}>
            编辑
          </span>
          {record.code !== 'admin' && (
            <span
              className="opp-row-action danger"
              onClick={() => handleDelete(record)}
            >
              删除
            </span>
          )}
        </span>
      ),
    },
  ];

  return (
    <div style={{ height: '100%' }}>
      <OmnibarListPage<RoleItem>
        filters={filterConfigs}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        toolbarActions={toolbarActions}
        data={pageList}
        columns={columns}
        loading={loading}
        rowKey="id"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        showCheckbox
        showIndex
        total={filtered.length}
        page={page}
        pageSize={pageSize}
        onPageChange={(p, s) => {
          setPage(p);
          setPageSize(s);
        }}
      />

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
