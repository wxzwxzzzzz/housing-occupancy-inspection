import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Form, Input, Modal, message, Popconfirm, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  type FilterConfig,
  OmnibarListPage,
  type ToolbarAction,
} from '@/components/OmnibarPage';
import { savedFilterService } from '@/services/domains/saved-filter';
import type { SavedFilter } from '@/types/ontology/prh/entities/saved_filter';
import FilterEditor from './FilterEditor';

type FilterItem = SavedFilter & { id: string };

const FilterList: React.FC = () => {
  const [filters, setFilters] = useState<FilterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [editorVisible, setEditorVisible] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterItem | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const env = await savedFilterService.list({
        page: { pageNo: 1, pageSize: 1000 },
      });
      setFilters(env.data as FilterItem[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 过滤后的列表(支持 keyword 搜索)
  const filteredList = filters.filter((f) => {
    if (filterValues.keyword) {
      const kw = String(filterValues.keyword).toLowerCase();
      if (
        !f.name.toLowerCase().includes(kw) &&
        !(f.description ?? '').toLowerCase().includes(kw)
      ) {
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
      const env = await savedFilterService.add({
        name: values.name,
        description: values.description || '',
        fieldCount: 0,
        status: 'active',
        jsonLogic: null,
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
      });
      setCreateModalVisible(false);
      form.resetFields();
      await load();
      if (env.data) {
        setCurrentFilter(env.data as FilterItem);
        setEditorVisible(true);
      }
      message.success('筛选器创建成功');
    } catch {
      // 表单验证失败,忽略
    }
  };

  const handleDelete = async (id: string) => {
    await savedFilterService.delete(id);
    message.success('筛选器已删除');
    load();
  };

  const handleCopy = async (record: FilterItem) => {
    await savedFilterService.add({
      name: `${record.name} (副本)`,
      description: record.description,
      fieldCount: record.fieldCount,
      status: record.status,
      jsonLogic: record.jsonLogic,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    });
    message.success('筛选器已复制');
    load();
  };

  const handleSaveFilter = async (filterData: {
    jsonLogic: any;
    fieldCount: number;
  }) => {
    if (currentFilter) {
      await savedFilterService.modify({
        id: currentFilter.id,
        jsonLogic: filterData.jsonLogic,
        fieldCount: filterData.fieldCount,
        updatedAt: new Date().toLocaleString(),
      });
      message.success('筛选器配置已保存');
      load();
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
      onOk: async () => {
        await Promise.all(
          selectedKeys.map((id) => savedFilterService.delete(String(id))),
        );
        setSelectedKeys([]);
        message.success('已删除');
        load();
      },
    });
  };

  const filterConfigs: FilterConfig[] = [
    {
      key: 'keyword',
      label: '关键字',
      type: 'input',
      placeholder: '名称 / 描述',
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
      key: 'create',
      label: '新建',
      type: 'primary',
      icon: <PlusOutlined />,
      onClick: handleCreate,
    },
    { divider: true },
    {
      key: 'delete',
      label: '批量删除',
      danger: true,
      onClick: handleBatchDelete,
    },
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
    <div style={{ height: '100%' }}>
      <OmnibarListPage<FilterItem>
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
          filter={{
            id: currentFilter.id,
            name: currentFilter.name,
            description: currentFilter.description,
            jsonLogic: currentFilter.jsonLogic,
          }}
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
