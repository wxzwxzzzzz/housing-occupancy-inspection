import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Table, Button, Space, Modal, Form, Input, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
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

// 模拟数据
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
  const [editorVisible, setEditorVisible] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterItem | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 打开编辑器
  const handleEdit = (record: FilterItem) => {
    setCurrentFilter(record);
    setEditorVisible(true);
  };

  // 创建新筛选器
  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  // 确认创建
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
      // 直接打开编辑器
      setCurrentFilter(newFilter);
      setEditorVisible(true);
      message.success('筛选器创建成功');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 删除筛选器
  const handleDelete = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
    message.success('筛选器已删除');
  };

  // 复制筛选器
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

  // 保存筛选器配置
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
            : f
        )
      );
      message.success('筛选器配置已保存');
    }
    setEditorVisible(false);
    setCurrentFilter(null);
  };

  const columns = [
    {
      title: '筛选器名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: FilterItem) => (
        <a onClick={() => handleEdit(record)}>{text}</a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '条件数量',
      dataIndex: 'fieldCount',
      key: 'fieldCount',
      width: 100,
      render: (count: number) => <Tag color="blue">{count} 个条件</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_: any, record: FilterItem) => (
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
            icon={<CopyOutlined />}
            onClick={() => handleCopy(record)}
          >
            复制
          </Button>
          <Popconfirm
            title="确定删除此筛选器吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: '筛选器管理',
        subTitle: '管理数据筛选条件，用于快速过滤和查询数据',
      }}
    >
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建筛选器
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={filters}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 创建筛选器弹窗 */}
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
            <Input.TextArea rows={3} placeholder="请输入筛选器描述（可选）" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 筛选器编辑器 */}
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
    </PageContainer>
  );
};

export default FilterList;
