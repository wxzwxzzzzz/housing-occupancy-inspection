import React, { useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Switch,
  Tag,
  TreeSelect,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  OmnibarListPage,
  type FilterConfig,
  type ToolbarAction,
} from '@/components/OmnibarPage';

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
  children?: MenuItem[];
}

const TYPE_LABEL: Record<string, string> = { menu: '菜单', button: '按钮' };
const TYPE_COLOR: Record<string, string> = { menu: 'blue', button: 'green' };
const STATUS_LABEL: Record<string, string> = { active: '启用', inactive: '停用' };
const STATUS_COLOR: Record<string, string> = { active: 'green', inactive: 'red' };

const FLAT_DATA: MenuItem[] = [
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
];

/** 把扁平数组组成树 */
function buildTree(flat: MenuItem[]): MenuItem[] {
  const map = new Map<string, MenuItem>();
  flat.forEach((m) => map.set(m.id, { ...m, children: [] }));
  const roots: MenuItem[] = [];
  flat.forEach((m) => {
    const node = map.get(m.id)!;
    if (m.parentId && map.has(m.parentId)) {
      map.get(m.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });
  // 清理空 children
  const clean = (n: MenuItem) => {
    if (n.children && n.children.length === 0) delete n.children;
    else n.children?.forEach(clean);
  };
  roots.forEach(clean);
  return roots;
}

const SystemMenu: React.FC = () => {
  const [data, setData] = useState<MenuItem[]>(FLAT_DATA);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<MenuItem | null>(null);
  const [form] = Form.useForm();

  // 过滤后的扁平数据
  const filteredFlat = useMemo(() => {
    const v = filterValues;
    return data.filter((m) => {
      if (v.keyword && !m.name.includes(v.keyword) && !m.path.includes(v.keyword)) return false;
      if (v.type && m.type !== v.type) return false;
      if (v.status && m.status !== v.status) return false;
      if (v.visible !== undefined && v.visible !== '' && v.visible !== null) {
        const want = v.visible === 'true' || v.visible === true;
        if (m.visible !== want) return false;
      }
      return true;
    });
  }, [data, filterValues]);

  // 树形(供 Table 显示) — 过滤后,保留命中节点的祖先链
  const treeData = useMemo(() => {
    if (Object.keys(filterValues).length === 0) {
      return buildTree(data);
    }
    const hitIds = new Set(filteredFlat.map((m) => m.id));
    // 把命中的节点的祖先也带上
    const expandedIds = new Set<string>(hitIds);
    let changed = true;
    while (changed) {
      changed = false;
      data.forEach((m) => {
        if (m.parentId && expandedIds.has(m.id) && !expandedIds.has(m.parentId)) {
          expandedIds.add(m.parentId);
          changed = true;
        }
      });
    }
    return buildTree(data.filter((m) => expandedIds.has(m.id)));
  }, [data, filteredFlat, filterValues]);

  const filters: FilterConfig[] = [
    { key: 'keyword', label: '关键字', type: 'input', placeholder: '名称 / 路径' },
    {
      key: 'type',
      label: '类型',
      type: 'quick',
      options: [
        { value: '', label: '全部' },
        { value: 'menu', label: '菜单' },
        { value: 'button', label: '按钮' },
      ],
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
    {
      key: 'visible',
      label: '可见',
      type: 'quick',
      options: [
        { value: '', label: '全部' },
        { value: 'true', label: '可见' },
        { value: 'false', label: '隐藏' },
      ],
    },
  ];

  const handleAdd = () => {
    setEditMode(false);
    setCurrentRecord(null);
    form.resetFields();
    form.setFieldsValue({ type: 'menu', sort: 1, visible: true, status: 'active' });
    setModalVisible(true);
  };

  const handleEdit = (record: MenuItem) => {
    setEditMode(true);
    setCurrentRecord(record);
    form.setFieldsValue({
      ...record,
      status: record.status === 'active',
    });
    setModalVisible(true);
  };

  const handleDelete = (record: MenuItem) => {
    Modal.confirm({
      title: '删除菜单',
      content: `确定要删除菜单 ${record.name} 吗?`,
      okType: 'danger',
      onOk: async () => {
        setLoading(true);
        try {
          // mock
          await new Promise((r) => setTimeout(r, 300));
          setData((prev) =>
            prev.filter((m) => m.id !== record.id && m.parentId !== record.id),
          );
          message.success('删除成功');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedKeys.length === 0) return;
    Modal.confirm({
      title: `批量删除 ${selectedKeys.length} 项`,
      content: '同时会移除其下的子菜单,确认?',
      okType: 'danger',
      onOk: () => {
        const idSet = new Set(selectedKeys.map(String));
        setData((prev) =>
          prev.filter((m) => !idSet.has(m.id) && !idSet.has(m.parentId ?? '')),
        );
        setSelectedKeys([]);
        message.success('已删除');
      },
    });
  };

  const handleMove = (record: MenuItem, dir: 'up' | 'down') => {
    setData((prev) => {
      const siblings = prev
        .filter((m) => (m.parentId ?? null) === (record.parentId ?? null))
        .sort((a, b) => a.sort - b.sort);
      const idx = siblings.findIndex((m) => m.id === record.id);
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= siblings.length) return prev;
      const aId = siblings[idx].id;
      const bId = siblings[swapIdx].id;
      const aSort = siblings[idx].sort;
      const bSort = siblings[swapIdx].sort;
      return prev.map((m) => {
        if (m.id === aId) return { ...m, sort: bSort };
        if (m.id === bId) return { ...m, sort: aSort };
        return m;
      });
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await new Promise((r) => setTimeout(r, 300));

      const next: MenuItem = {
        id: editMode && currentRecord ? currentRecord.id : `new-${Date.now()}`,
        name: values.name,
        path: values.path,
        icon: values.icon,
        parentId: values.parentId,
        sort: Number(values.sort) || 1,
        type: values.type,
        permission: values.permission,
        visible: values.visible !== false,
        status: values.status === false ? 'inactive' : 'active',
      };

      setData((prev) => {
        if (editMode) return prev.map((m) => (m.id === next.id ? next : m));
        return [...prev, next];
      });
      message.success(editMode ? '编辑成功' : '新增成功');
      setModalVisible(false);
      form.resetFields();
    } finally {
      setLoading(false);
    }
  };

  const toolbarActions: ToolbarAction[] = [
    {
      key: 'add',
      type: 'primary',
      label: '新增菜单',
      icon: <PlusOutlined />,
      onClick: handleAdd,
    },
    {
      key: 'batchDelete',
      label: '批量删除',
      danger: true,
      disabled: selectedKeys.length === 0,
      onClick: handleBatchDelete,
    },
    { divider: true },
    {
      key: 'refresh',
      type: 'icon',
      icon: <ReloadOutlined />,
      title: '刷新',
      onClick: () => {
        setData(FLAT_DATA);
        message.success('已刷新');
      },
    },
  ];

  const columns: ColumnsType<MenuItem> = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      width: 240,
      render: (text: string, record) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {record.icon && <span>📁</span>}
          <span>{text}</span>
        </span>
      ),
    },
    { title: '路径', dataIndex: 'path', width: 200 },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 120,
      render: (text) => (text ? <Tag>{text}</Tag> : '-'),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 90,
      render: (t: string) => <Tag color={TYPE_COLOR[t]}>{TYPE_LABEL[t] ?? t}</Tag>,
    },
    {
      title: '权限标识',
      dataIndex: 'permission',
      width: 160,
      render: (v) => v || '-',
    },
    { title: '排序', dataIndex: 'sort', width: 70, align: 'center' },
    {
      title: '可见',
      dataIndex: 'visible',
      width: 70,
      align: 'center',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '是' : '否'}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: string) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s] ?? s}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_: any, record: MenuItem) => (
        <span className="opp-row-actions">
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
              handleMove(record, 'up');
            }}
            title="上移"
          >
            <ArrowUpOutlined />
          </span>
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
              handleMove(record, 'down');
            }}
            title="下移"
          >
            <ArrowDownOutlined />
          </span>
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          >
            编辑
          </span>
          <span
            className="opp-row-action danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record);
            }}
          >
            删除
          </span>
        </span>
      ),
    },
  ];

  const menuTreeData = useMemo(
    () =>
      data
        .filter((item) => !item.parentId)
        .map((item) => ({
          title: item.name,
          value: item.id,
          children: data
            .filter((child) => child.parentId === item.id)
            .map((child) => ({ title: child.name, value: child.id })),
        })),
    [data],
  );

  return (
    <div style={{ height: '100%' }}>
      <OmnibarListPage<MenuItem>
        filters={filters}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        onSearch={() => {}}
        toolbarActions={toolbarActions}
        data={treeData}
        columns={columns}
        loading={loading}
        rowKey="id"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        showCheckbox
        showIndex={false}
        scroll={{ x: 1400 }}
        total={filteredFlat.length}
        page={1}
        pageSize={filteredFlat.length || 10}
        onPageChange={() => {}}
        hideFooter
      />

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
              placeholder="请选择上级菜单(不选则为顶级菜单)"
              allowClear
              treeData={menuTreeData}
            />
          </Form.Item>
          <Form.Item
            name="path"
            label="路由路径"
            rules={[{ required: true, message: '请输入路由路径' }]}
          >
            <Input placeholder="如:/system/menu" />
          </Form.Item>
          <Form.Item name="icon" label="图标">
            <Input placeholder="如:menu, setting" />
          </Form.Item>
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select>
              <Option value="menu">菜单</Option>
              <Option value="button">按钮</Option>
            </Select>
          </Form.Item>
          <Form.Item name="permission" label="权限标识">
            <Input placeholder="如:system:menu:view" />
          </Form.Item>
          <Form.Item
            name="sort"
            label="排序"
            rules={[{ required: true, message: '请输入排序号' }]}
          >
            <Input type="number" placeholder="数字越小越靠前" />
          </Form.Item>
          <Form.Item name="visible" label="是否可见" valuePropName="checked">
            <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemMenu;
