import React, { useState } from 'react';
import { Button, Modal, Form, Input, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import {
  OmnibarListPage,
  type FilterConfig,
  type ToolbarAction,
} from '@/components/OmnibarPage';
import FilterEditor from './FilterEditor';

interface FilterItem {
  id: string;
  name: string;
  description: string;
  fieldCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
  jsonLogic: any;
}

const mockFilters: FilterItem[] = [
  {
    id: '1',
    name: '高风险房屋筛选',
    description: '筛选面积大于100平米且入住时间超过5年的房屋',
    fieldCount: 3,
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-01-20 14:20:00',
    status: 'active',
    jsonLogic: null,
  },
  {
    id: '2',
    name: '待审核申请筛选',
    description: '筛选状态为待审核且提交时间在30天内的申请',
    fieldCount: 2,
    createdAt: '2024-01-10 09:00:00',
    updatedAt: '2024-01-18 16:45:00',
    status: 'active',
    jsonLogic: null,
  },
  {
    id: '3',
    name: '异常数据筛选',
    description: '筛选入住人数异常或面积数据异常的记录',
    fieldCount: 4,
    createdAt: '2024-01-05 11:20:00',
    updatedAt: '2024-01-12 10:30:00',
    status: 'inactive',
    jsonLogic: null,
  },
];

const FilterList: React.FC = () => {
  const [filters, setFilters] = useState<FilterItem[]>(mockFilters);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [editorVisible, setEditorVisible] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterItem | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 过滤后的列表(支持 keyword 搜索)
  const filteredList = filters.filter((f) => {
    if (filterValues.keyword) {
      const kw = String(filterValues.keyword).toLowerCase();
      if (!f.name.toLowerCase().includes(kw) && !f.description.toLowerCase().includes(kw)) {
        return false;
      }
    }
    if (filterValues.status && f.status !== filterValues.status) return false;
    return true;
  });
  const start = (page - 1) * pageSize;
  const pageList = filteredList.slice(start, start + pageSize);

  const handleEdit = (record: FilterItem) => {
    setCurrentFilter(record);
    setEditorVisible(true);
  };

  const handleCreate = () => setCreateModalVisible(true);

  const handleCreateConfirm = async () => {
    try {
      const values = await form.validateFields();
      const newFilter: FilterItem = {
        id: Date.now().toString(),
        name: values.name,
        description: values.description || '',
        fieldCount: 0,
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
        status: 'active',
        jsonLogic: null,
      };
      setFilters([newFilter, ...filters]);
      setCreateModalVisible(false);
      form.resetFields();
      setCurrentFilter(newFilter);
      setEditorVisible(true);
      message.success('筛选器创建成功');
    } catch {
      // 表单验证失败,忽略
    }
  };

  const handleDelete = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
    message.success('筛选器已删除');
  };

  const handleCopy = (record: FilterItem) => {
    const newFilter: FilterItem = {
      ...record,
      id: Date.now().toString(),
      name: `${record.name} (副本)`,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    };
    setFilters([newFilter, ...filters]);
    message.success('筛选器已复制');
  };

  const handleSaveFilter = (filterData: { jsonLogic: any; fieldCount: number }) => {
    if (currentFilter) {
      setFilters(
        filters.map((f) =>
          f.id === currentFilter.id
            ? {
                ...f,
                jsonLogic: filterData.jsonLogic,
                fieldCount: filterData.fieldCount,
                updatedAt: new Date().toLocaleString(),
              }
            : f,
        ),
      );
      message.success('筛选器配置已保存');
    }
    setEditorVisible(false);
    setCurrentFilter(null);
  };

  const handleBatchDelete = () => {
    if (selectedKeys.length === 0) {
      message.warning('请先选择要删除的筛选器');
      return;
    }
    Modal.confirm({
      title: `确定删除选中的 ${selectedKeys.length} 个筛选器吗?`,
      onOk: () => {
        setFilters(filters.filter((f) => !selectedKeys.includes(f.id)));
        setSelectedKeys([]);
        message.success('已删除');
      },
    });
  };

  const filterConfigs: FilterConfig[] = [
    { key: 'keyword', label: '关键字', type: 'input', placeholder: '名称 / 描述' },
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
    { key: 'create', label: '新建', type: 'primary', icon: <PlusOutlined />, onClick: handleCreate },
    { divider: true },
    { key: 'delete', label: '批量删除', danger: true, onClick: handleBatchDelete },
  ];

  const columns = [
    {
      title: '筛选器名称',
      dataIndex: 'name',
      render: (text: string, record: FilterItem) => (
        <span className="opp-link-cell" onClick={() => handleEdit(record)}>
          {text}
        </span>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '条件数',
      dataIndex: 'fieldCount',
      width: 100,
      render: (count: number) => <Tag color="blue">{count} 个</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_: any, record: FilterItem) => (
        <span className="opp-row-actions">
          <span className="opp-row-action" onClick={() => handleEdit(record)}>
            <EditOutlined /> 编辑
          </span>
          <span className="opp-row-action" onClick={() => handleCopy(record)}>
            <CopyOutlined /> 复制
          </span>
          <Popconfirm
            title="确定删除此筛选器吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <span className="opp-row-action danger">
              <DeleteOutlined /> 删除
            </span>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: 16, height: 'calc(100vh - 64px - 45px)' }}>
      <OmnibarListPage<FilterItem>
        filters={filterConfigs}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        toolbarActions={toolbarActions}
        data={pageList}
        columns={columns}
        rowKey="id"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        showCheckbox
        showIndex
        total={filteredList.length}
        page={page}
        pageSize={pageSize}
        onPageChange={(p, s) => {
          setPage(p);
          setPageSize(s);
        }}
      />

      <Modal
        title="新建筛选器"
        open={createModalVisible}
        onOk={handleCreateConfirm}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        okText="创建并编辑"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="筛选器名称"
            rules={[{ required: true, message: '请输入筛选器名称' }]}
          >
            <Input placeholder="请输入筛选器名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入筛选器描述(可选)" />
          </Form.Item>
        </Form>
      </Modal>

      {editorVisible && currentFilter && (
        <FilterEditor
          visible={editorVisible}
          filter={currentFilter}
          onSave={handleSaveFilter}
          onCancel={() => {
            setEditorVisible(false);
            setCurrentFilter(null);
          }}
        />
      )}
    </div>
  );
};

export default FilterList;
