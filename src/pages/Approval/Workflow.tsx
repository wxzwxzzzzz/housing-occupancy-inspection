import {
  ApartmentOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  message,
  Select,
  Space,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useState } from 'react';
import {
  type FilterConfig,
  OmnibarListPage,
  type ToolbarAction,
} from '@/components/OmnibarPage';
import { approvalFlowService } from '@/services/domains/approval-flow';
import type { ApprovalFlow } from '@/types/ontology/prh/entities/approval_flow';
import ApprovalChainDesigner from './ApprovalChainDesigner';
import { defaultChainFor } from './ApprovalChainDesigner/templates';
import {
  type ApprovalChainGraph,
  isApprovalChainGraph,
} from './ApprovalChainDesigner/types';

interface WorkflowItem {
  key: string;
  id?: string;
  name: string;
  status: string;
  creator: string;
  createTime: string;
  description: string;
}

const ApprovalWorkflow: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('material');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'design'>(
    'list',
  );
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<WorkflowItem | null>(
    null,
  );
  // 流程元数据 新建/编辑 Modal
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [saving, setSaving] = useState(false);
  const [metaForm] = Form.useForm();
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  // 流程列表(走 service)
  const [flows, setFlows] = useState<ApprovalFlow[]>([]);

  const loadFlows = async () => {
    setLoading(true);
    try {
      const env = await approvalFlowService.list({
        page: { pageNo: 1, pageSize: 1000 },
      });
      setFlows(env.data as ApprovalFlow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 流程下拉(由列表派生)
  const workflowOptions = flows.map((f) => ({
    label: f.name,
    value: f.flowKey,
  }));

  // 流程详情(由列表派生,key = flowKey)
  const workflowDetails: Record<string, any> = useMemo(() => {
    const map: Record<string, any> = {};
    for (const f of flows) map[f.flowKey] = { ...f };
    return map;
  }, [flows]);

  // 准备表格数据(由 service 加载的 flows 派生,key = flowKey)
  const workflowList: WorkflowItem[] = flows.map((f) => ({
    key: f.flowKey,
    id: f.id,
    name: f.name,
    status: f.status,
    creator: f.creatorName ?? '',
    createTime: f.createTime ?? '',
    description: f.description ?? '',
  }));

  // 定义表格列
  const columns: ColumnsType<WorkflowItem> = [
    {
      title: '流程名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === '已启用' ? 'success' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
    },
    {
      title: '流程说明',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_: any, record: WorkflowItem) => (
        <span className="opp-row-actions">
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
              handleView(record.key);
            }}
          >
            <EyeOutlined /> 查看
          </span>
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          >
            <EditOutlined /> 编辑
          </span>
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
              handleDesign(record);
            }}
          >
            <ApartmentOutlined /> 设计
          </span>
          <span
            className="opp-row-action danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record);
            }}
          >
            <DeleteOutlined /> 删除
          </span>
        </span>
      ),
    },
  ];

  // 切换流程
  const handleWorkflowChange = (value: string) => {
    setSelectedWorkflow(value);
  };

  // 刷新流程图
  const handleRefresh = () => {
    if (viewMode === 'list') {
      loadFlows();
      message.success('列表刷新成功');
    }
  };

  // 查看流程详情
  const handleView = (key: string) => {
    setSelectedWorkflow(key);
    setViewMode('detail');
  };

  // 返回列表
  const handleBackToList = () => {
    setViewMode('list');
  };

  // 新建流程(新建一条流程记录,只填元数据)
  const handleCreate = () => {
    setFormMode('create');
    setCurrentEditItem(null);
    metaForm.resetFields();
    metaForm.setFieldsValue({ status: '已启用' });
    setFormModalOpen(true);
  };

  // 编辑流程(编辑这条记录的元数据)
  const handleEdit = (record: WorkflowItem) => {
    setFormMode('edit');
    setCurrentEditItem(record);
    metaForm.setFieldsValue({
      name: record.name,
      flowKey: record.key,
      status: record.status,
      description: record.description,
    });
    setFormModalOpen(true);
  };

  // 保存流程元数据(新建 / 编辑)
  const handleMetaSave = async () => {
    let values: any;
    try {
      values = await metaForm.validateFields();
    } catch {
      return;
    }
    setSaving(true);
    try {
      if (formMode === 'create') {
        if (flows.some((f) => f.flowKey === values.flowKey)) {
          message.error(`流程标识「${values.flowKey}」已存在`);
          setSaving(false);
          return;
        }
        await approvalFlowService.add({
          flowKey: values.flowKey,
          name: values.name,
          status: values.status,
          description: values.description,
          creatorName: '管理员',
          createTime: new Date().toISOString().slice(0, 10),
          graph: defaultChainFor(values.flowKey),
        });
        message.success('流程创建成功');
      } else if (currentEditItem?.id) {
        await approvalFlowService.modify({
          id: currentEditItem.id,
          name: values.name,
          status: values.status,
          description: values.description,
        });
        message.success('流程更新成功');
      }
      await loadFlows();
      setFormModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  // 设计流程(打开流程图设计器,编辑 graph)
  const handleDesign = (record: WorkflowItem) => {
    setCurrentEditItem(record);
    setSelectedWorkflow(record.key);
    setViewMode('design');
  };

  // 保存流程图设计
  const handleSaveDesign = async (graphData: ApprovalChainGraph) => {
    if (currentEditItem?.id) {
      await approvalFlowService.modify({
        id: currentEditItem.id,
        graph: graphData,
      });
      await loadFlows();
    }
    message.success('流程图保存成功');
    setViewMode('list');
  };

  // 取消设计
  const handleCancelDesign = () => {
    setViewMode('list');
  };

  // 删除流程
  const handleDelete = (record: WorkflowItem) => {
    setCurrentEditItem(record);
    setDeleteModalVisible(true);
  };

  // 确认删除
  const handleDeleteOk = async () => {
    if (currentEditItem?.id) {
      await approvalFlowService.delete(currentEditItem.id);
      await loadFlows();
    }
    message.success('流程删除成功');
    setDeleteModalVisible(false);
  };

  // 取消删除
  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
  };

  const currentWorkflow = workflowDetails[selectedWorkflow];

  const filtered = useMemo(() => {
    const v = filterValues;
    return workflowList.filter((w) => {
      if (
        v.keyword &&
        !w.name.includes(v.keyword) &&
        !w.description.includes(v.keyword)
      )
        return false;
      if (v.status && w.status !== v.status) return false;
      return true;
    });
  }, [workflowList, filterValues]);

  const filters: FilterConfig[] = [
    {
      key: 'keyword',
      label: '关键字',
      type: 'input',
      placeholder: '名称 / 说明',
    },
    {
      key: 'status',
      label: '状态',
      type: 'quick',
      options: [
        { value: '', label: '全部' },
        { value: '已启用', label: '已启用' },
        { value: '已停用', label: '已停用' },
      ],
    },
  ];

  const toolbarActions: ToolbarAction[] = [
    {
      key: 'create',
      type: 'primary',
      label: '新建',
      icon: <PlusOutlined />,
      onClick: handleCreate,
    },
    { divider: true },
    {
      key: 'refresh',
      type: 'icon',
      icon: <ReloadOutlined />,
      title: '刷新',
      onClick: handleRefresh,
    },
  ];

  // 列表视图(OmnibarPage 三段式)
  const renderListView = () => (
    <div style={{ height: '100%' }}>
      <OmnibarListPage<WorkflowItem>
        filters={filters}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        onSearch={() => setPage(1)}
        toolbarActions={toolbarActions}
        data={filtered.slice((page - 1) * pageSize, page * pageSize)}
        columns={columns}
        loading={loading}
        rowKey="key"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        showCheckbox
        showIndex
        onRowClick={(r) => handleView(r.key)}
        total={filtered.length}
        page={page}
        pageSize={pageSize}
        onPageChange={(p, s) => {
          setPage(p);
          setPageSize(s);
        }}
      />
    </div>
  );

  // 详情视图
  const renderDetailView = () => (
    <Card
      title={
        <Space>
          <EyeOutlined />
          <span>审批流程详情</span>
        </Space>
      }
      extra={
        <Space>
          <Button onClick={handleBackToList}>
            返回
          </Button>
          <Select
            value={selectedWorkflow}
            onChange={handleWorkflowChange}
            options={workflowOptions}
            style={{ width: 180 }}
          />
          <Button onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
      }
    >
      {/* 流程信息 */}
      <Descriptions
        bordered
        column={3}
        size="small"
        style={{ marginBottom: 24 }}
        items={[
          {
            key: 'name',
            label: '流程名称',
            children: currentWorkflow?.name,
          },
          {
            key: 'status',
            label: '状态',
            children: (
              <Tag
                color={
                  currentWorkflow?.status === '已启用' ? 'success' : 'default'
                }
              >
                {currentWorkflow?.status}
              </Tag>
            ),
          },
          {
            key: 'creator',
            label: '创建人',
            children: currentWorkflow?.creator,
          },
          {
            key: 'createTime',
            label: '创建时间',
            children: currentWorkflow?.createTime,
          },
          {
            key: 'description',
            label: '流程说明',
            children: currentWorkflow?.description,
            span: 3,
          },
        ]}
      />

      {/* 审批链预览(只读) */}
      <div
        style={{
          border: '1px solid #e8e8e8',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <ApprovalChainDesigner
          readOnly
          bare
          graph={(() => {
            const saved = currentWorkflow?.graph;
            return isApprovalChainGraph(saved)
              ? saved
              : defaultChainFor(selectedWorkflow);
          })()}
          onSave={() => {}}
          onCancel={() => {}}
        />
      </div>
    </Card>
  );

  return (
    <>
      {viewMode === 'list' && renderListView()}
      {viewMode === 'detail' && (
        <div style={{ padding: '24px' }}>{renderDetailView()}</div>
      )}
      {viewMode === 'design' && currentEditItem && (
        <ApprovalChainDesigner
          workflowName={currentEditItem.name}
          graph={(() => {
            const saved = workflowDetails[currentEditItem.key]?.graph;
            return isApprovalChainGraph(saved)
              ? saved
              : defaultChainFor(currentEditItem.key);
          })()}
          onSave={handleSaveDesign}
          onCancel={handleCancelDesign}
        />
      )}

      {/* 新建 / 编辑 流程元数据 Modal */}
      <Modal
        title={formMode === 'create' ? '新建流程' : '编辑流程'}
        open={formModalOpen}
        onOk={handleMetaSave}
        onCancel={() => setFormModalOpen(false)}
        okText="保存"
        cancelText="取消"
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={metaForm} layout="vertical" preserve={false}>
          <Form.Item
            label="流程名称"
            name="name"
            rules={[{ required: true, message: '请输入流程名称' }]}
          >
            <Input placeholder="如:材料审批流程" />
          </Form.Item>
          <Form.Item
            label="流程标识"
            name="flowKey"
            rules={[
              { required: true, message: '请输入流程标识' },
              {
                pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                message: '以字母开头,仅含字母、数字、下划线',
              },
            ]}
            extra="流程的唯一业务键,创建后不可修改,如 material / leave"
          >
            <Input placeholder="如:material" disabled={formMode === 'edit'} />
          </Form.Item>
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select
              options={[
                { value: '已启用', label: '已启用' },
                { value: '已停用', label: '已停用' },
              ]}
            />
          </Form.Item>
          <Form.Item label="流程说明" name="description">
            <Input.TextArea rows={3} placeholder="请输入流程说明" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 删除确认 Modal */}
      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="确认"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确定要删除流程 "{currentEditItem?.name}" 吗?此操作不可恢复。</p>
      </Modal>
    </>
  );
};

export default ApprovalWorkflow;
