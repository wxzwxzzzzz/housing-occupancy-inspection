import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  message,
  Modal,
  Select,
  Space,
  Tag,
} from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FullscreenOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import LogicFlow from '@logicflow/core';
import '@logicflow/core/dist/index.css';
import type { ColumnsType } from 'antd/es/table';
import WorkflowEditor from './WorkflowEditor';
import {
  OmnibarListPage,
  type FilterConfig,
  type ToolbarAction,
} from '@/components/OmnibarPage';

interface WorkflowItem {
  key: string;
  name: string;
  version: string;
  status: string;
  creator: string;
  createTime: string;
  description: string;
}

const ApprovalWorkflow: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lfRef = useRef<LogicFlow | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('material');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'edit'>('list');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<WorkflowItem | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  // 模拟流程数据
  const workflowOptions = [
    { label: '材料审批流程', value: 'material' },
    { label: '请假审批流程', value: 'leave' },
    { label: '备案审批流程', value: 'filing' },
  ];

  // 流程详情数据
  const workflowDetails: Record<string, any> = {
    material: {
      name: '材料审批流程',
      version: 'v1.2',
      status: '已启用',
      creator: '管理员',
      createTime: '2024-01-15',
      description: '保障户材料提交审批流程，包括材料提交、初审、复审、终审等环节',
    },
    leave: {
      name: '请假审批流程',
      version: 'v1.0',
      status: '已启用',
      creator: '管理员',
      createTime: '2024-01-20',
      description: '保障户请假申请审批流程，包括申请提交、主管审批、备案等环节',
    },
    filing: {
      name: '备案审批流程',
      version: 'v1.1',
      status: '已启用',
      creator: '管理员',
      createTime: '2024-02-01',
      description: '保障户外出备案审批流程，包括备案申请、审核、批准等环节',
    },
  };

  // 不同流程的流程图数据
  const workflowData: Record<string, any> = {
    material: {
      nodes: [
        {
          id: 'node_1',
          type: 'rect',
          x: 150,
          y: 80,
          text: '提交材料',
          properties: {
            role: '保障户',
            description: '上传身份证、房产证等材料',
          },
        },
        {
          id: 'node_2',
          type: 'rect',
          x: 150,
          y: 180,
          text: '初审',
          properties: {
            role: '初审员',
            description: '检查材料完整性',
          },
        },
        {
          id: 'node_3',
          type: 'diamond',
          x: 150,
          y: 280,
          text: '初审通过?',
        },
        {
          id: 'node_4',
          type: 'rect',
          x: 350,
          y: 280,
          text: '退回修改',
          properties: {
            role: '系统',
            description: '通知保障户修改材料',
          },
        },
        {
          id: 'node_5',
          type: 'rect',
          x: 150,
          y: 380,
          text: '复审',
          properties: {
            role: '复审员',
            description: '核实材料真实性',
          },
        },
        {
          id: 'node_6',
          type: 'diamond',
          x: 150,
          y: 480,
          text: '复审通过?',
        },
        {
          id: 'node_7',
          type: 'rect',
          x: 150,
          y: 580,
          text: '终审',
          properties: {
            role: '审批主管',
            description: '最终审批决策',
          },
        },
        {
          id: 'node_8',
          type: 'rect',
          x: 150,
          y: 680,
          text: '审批完成',
          properties: {
            role: '系统',
            description: '更新审批状态',
          },
        },
      ],
      edges: [
        { id: 'edge_1', type: 'polyline', sourceNodeId: 'node_1', targetNodeId: 'node_2' },
        { id: 'edge_2', type: 'polyline', sourceNodeId: 'node_2', targetNodeId: 'node_3' },
        {
          id: 'edge_3',
          type: 'polyline',
          sourceNodeId: 'node_3',
          targetNodeId: 'node_4',
          text: '不通过',
        },
        {
          id: 'edge_4',
          type: 'polyline',
          sourceNodeId: 'node_4',
          targetNodeId: 'node_1',
          text: '重新提交',
        },
        {
          id: 'edge_5',
          type: 'polyline',
          sourceNodeId: 'node_3',
          targetNodeId: 'node_5',
          text: '通过',
        },
        { id: 'edge_6', type: 'polyline', sourceNodeId: 'node_5', targetNodeId: 'node_6' },
        {
          id: 'edge_7',
          type: 'polyline',
          sourceNodeId: 'node_6',
          targetNodeId: 'node_4',
          text: '不通过',
        },
        {
          id: 'edge_8',
          type: 'polyline',
          sourceNodeId: 'node_6',
          targetNodeId: 'node_7',
          text: '通过',
        },
        { id: 'edge_9', type: 'polyline', sourceNodeId: 'node_7', targetNodeId: 'node_8' },
      ],
    },
    leave: {
      nodes: [
        {
          id: 'node_1',
          type: 'rect',
          x: 150,
          y: 80,
          text: '提交请假申请',
          properties: {
            role: '保障户',
            description: '填写请假时间和原因',
          },
        },
        {
          id: 'node_2',
          type: 'diamond',
          x: 150,
          y: 180,
          text: '请假天数>3天?',
        },
        {
          id: 'node_3',
          type: 'rect',
          x: 350,
          y: 180,
          text: '自动通过',
          properties: {
            role: '系统',
            description: '3天以内自动批准',
          },
        },
        {
          id: 'node_4',
          type: 'rect',
          x: 150,
          y: 280,
          text: '主管审批',
          properties: {
            role: '审批主管',
            description: '审核请假理由',
          },
        },
        {
          id: 'node_5',
          type: 'diamond',
          x: 150,
          y: 380,
          text: '审批通过?',
        },
        {
          id: 'node_6',
          type: 'rect',
          x: 350,
          y: 380,
          text: '驳回申请',
          properties: {
            role: '系统',
            description: '通知保障户',
          },
        },
        {
          id: 'node_7',
          type: 'rect',
          x: 150,
          y: 480,
          text: '审批完成',
          properties: {
            role: '系统',
            description: '更新请假记录',
          },
        },
      ],
      edges: [
        { id: 'edge_1', type: 'polyline', sourceNodeId: 'node_1', targetNodeId: 'node_2' },
        {
          id: 'edge_2',
          type: 'polyline',
          sourceNodeId: 'node_2',
          targetNodeId: 'node_3',
          text: '否',
        },
        { id: 'edge_3', type: 'polyline', sourceNodeId: 'node_3', targetNodeId: 'node_7' },
        {
          id: 'edge_4',
          type: 'polyline',
          sourceNodeId: 'node_2',
          targetNodeId: 'node_4',
          text: '是',
        },
        { id: 'edge_5', type: 'polyline', sourceNodeId: 'node_4', targetNodeId: 'node_5' },
        {
          id: 'edge_6',
          type: 'polyline',
          sourceNodeId: 'node_5',
          targetNodeId: 'node_6',
          text: '不通过',
        },
        {
          id: 'edge_7',
          type: 'polyline',
          sourceNodeId: 'node_5',
          targetNodeId: 'node_7',
          text: '通过',
        },
      ],
    },
    filing: {
      nodes: [
        {
          id: 'node_1',
          type: 'rect',
          x: 150,
          y: 80,
          text: '提交备案申请',
          properties: {
            role: '保障户',
            description: '填写外出时间和地址',
          },
        },
        {
          id: 'node_2',
          type: 'rect',
          x: 150,
          y: 180,
          text: '系统校验',
          properties: {
            role: '系统',
            description: '检查备案信息完整性',
          },
        },
        {
          id: 'node_3',
          type: 'diamond',
          x: 150,
          y: 280,
          text: '信息完整?',
        },
        {
          id: 'node_4',
          type: 'rect',
          x: 350,
          y: 280,
          text: '退回补充',
          properties: {
            role: '系统',
            description: '提示缺失信息',
          },
        },
        {
          id: 'node_5',
          type: 'rect',
          x: 150,
          y: 380,
          text: '审核备案',
          properties: {
            role: '审核员',
            description: '审核备案合理性',
          },
        },
        {
          id: 'node_6',
          type: 'diamond',
          x: 150,
          y: 480,
          text: '审核通过?',
        },
        {
          id: 'node_7',
          type: 'rect',
          x: 150,
          y: 580,
          text: '备案完成',
          properties: {
            role: '系统',
            description: '生成地理围栏',
          },
        },
      ],
      edges: [
        { id: 'edge_1', type: 'polyline', sourceNodeId: 'node_1', targetNodeId: 'node_2' },
        { id: 'edge_2', type: 'polyline', sourceNodeId: 'node_2', targetNodeId: 'node_3' },
        {
          id: 'edge_3',
          type: 'polyline',
          sourceNodeId: 'node_3',
          targetNodeId: 'node_4',
          text: '否',
        },
        {
          id: 'edge_4',
          type: 'polyline',
          sourceNodeId: 'node_4',
          targetNodeId: 'node_1',
          text: '重新提交',
        },
        {
          id: 'edge_5',
          type: 'polyline',
          sourceNodeId: 'node_3',
          targetNodeId: 'node_5',
          text: '是',
        },
        { id: 'edge_6', type: 'polyline', sourceNodeId: 'node_5', targetNodeId: 'node_6' },
        {
          id: 'edge_7',
          type: 'polyline',
          sourceNodeId: 'node_6',
          targetNodeId: 'node_4',
          text: '不通过',
        },
        {
          id: 'edge_8',
          type: 'polyline',
          sourceNodeId: 'node_6',
          targetNodeId: 'node_7',
          text: '通过',
        },
      ],
    },
  };

  // 准备表格数据
  const workflowList: WorkflowItem[] = Object.keys(workflowDetails).map((key) => ({
    key,
    ...workflowDetails[key],
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
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 100,
      render: (version: string) => <Tag color="blue">{version}</Tag>,
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
      width: 220,
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

  // 初始化 LogicFlow (在详情或编辑模式时)
  useEffect(() => {
    if ((viewMode !== 'detail' && viewMode !== 'edit') || !containerRef.current) return;

    // 如果已经存在实例，先销毁
    if (lfRef.current) {
      lfRef.current.destroy();
    }

    // 创建新的 LogicFlow 实例
    const lf = new LogicFlow({
      container: containerRef.current,
      width: containerRef.current.offsetWidth,
      height: 700,
      grid: {
        size: 10,
        visible: true,
        type: 'dot',
        config: {
          color: '#e6e6e6',
        },
      },
      background: {
        color: '#fafafa',
      },
      keyboard: {
        enabled: true,
      },
      // 编辑模式时允许编辑，详情模式时只读
      isSilentMode: viewMode === 'detail',
      edgeType: 'polyline',
      style: {
        rect: {
          rx: 5,
          ry: 5,
          strokeWidth: 2,
        },
        circle: {
          fill: '#f5f5f5',
          stroke: '#666',
        },
        diamond: {
          fill: '#ffe7ba',
          stroke: '#ffa940',
        },
        text: {
          color: '#333',
          fontSize: 13,
        },
      },
    });

    lfRef.current = lf;

    // 加载流程图数据
    loadWorkflowData(selectedWorkflow);

    // 监听窗口大小变化
    const handleResize = () => {
      if (containerRef.current && lfRef.current) {
        lfRef.current.resize(containerRef.current.offsetWidth, 700);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (lfRef.current) {
        lfRef.current.destroy();
        lfRef.current = null;
      }
    };
  }, [viewMode, selectedWorkflow]);

  // 加载流程图数据
  const loadWorkflowData = (workflowType: string) => {
    if (!lfRef.current) return;

    setLoading(true);
    try {
      const data = workflowData[workflowType];
      if (data) {
        lfRef.current.render(data);
        // 居中显示
        lfRef.current.translateCenter();
        message.success('流程图加载成功');
      }
    } catch (error) {
      message.error('流程图加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换流程
  const handleWorkflowChange = (value: string) => {
    setSelectedWorkflow(value);
    loadWorkflowData(value);
  };

  // 刷新流程图
  const handleRefresh = () => {
    if (viewMode === 'list') {
      message.success('列表刷新成功');
    } else {
      loadWorkflowData(selectedWorkflow);
    }
  };

  // 全屏查看
  const handleFullscreen = () => {
    message.info('全屏功能开发中');
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

  // 编辑流程
  const handleEdit = (record: WorkflowItem) => {
    setCurrentEditItem(record);
    setSelectedWorkflow(record.key);
    setViewMode('edit');
  };

  // 保存编辑
  const handleSaveEdit = (values: any, graphData: any) => {
    console.log('保存流程:', currentEditItem?.key, values, graphData);
    message.success('流程保存成功');
    setViewMode('list');
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setViewMode('list');
  };

  // 删除流程
  const handleDelete = (record: WorkflowItem) => {
    setCurrentEditItem(record);
    setDeleteModalVisible(true);
  };

  // 确认删除
  const handleDeleteOk = () => {
    console.log('删除流程:', currentEditItem?.key);
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
      if (v.keyword && !w.name.includes(v.keyword) && !w.description.includes(v.keyword))
        return false;
      if (v.status && w.status !== v.status) return false;
      return true;
    });
  }, [workflowList, filterValues]);

  const filters: FilterConfig[] = [
    { key: 'keyword', label: '关键字', type: 'input', placeholder: '名称 / 说明' },
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
      label: '新建流程',
      icon: <PlusOutlined />,
      onClick: () => message.info('新建流程功能开发中'),
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
    <div style={{ padding: 16, height: 'calc(100vh - 64px - 45px)' }}>
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
          <Button icon={<ArrowLeftOutlined />} onClick={handleBackToList}>
            返回列表
          </Button>
          <Select
            value={selectedWorkflow}
            onChange={handleWorkflowChange}
            options={workflowOptions}
            style={{ width: 180 }}
          />
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
          <Button icon={<FullscreenOutlined />} onClick={handleFullscreen}>
            全屏
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
            key: 'version',
            label: '版本',
            children: <Tag color="blue">{currentWorkflow?.version}</Tag>,
          },
          {
            key: 'status',
            label: '状态',
            children: (
              <Tag color={currentWorkflow?.status === '已启用' ? 'success' : 'default'}>
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

      {/* 流程图容器 */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: 700,
          border: '1px solid #e8e8e8',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
        }}
      />

      {/* 图例说明 */}
      <div
        style={{
          marginTop: 16,
          padding: 16,
          background: '#fafafa',
          borderRadius: 4,
        }}
      >
        <Space size={24}>
          <Space>
            <div
              style={{
                width: 40,
                height: 30,
                background: '#fff',
                border: '2px solid #000',
                borderRadius: 4,
              }}
            />
            <span>流程节点</span>
          </Space>
          <Space>
            <div
              style={{
                width: 40,
                height: 30,
                background: '#ffe7ba',
                border: '2px solid #ffa940',
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              }}
            />
            <span>判断节点</span>
          </Space>
          <Space>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 30, height: 2, background: '#000' }} />
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid #000',
                  borderTop: '4px solid transparent',
                  borderBottom: '4px solid transparent',
                }}
              />
            </div>
            <span>流程流转</span>
          </Space>
        </Space>
      </div>
    </Card>
  );

  return (
    <>
      {viewMode === 'list' && renderListView()}
      {viewMode === 'detail' && <div style={{ padding: '24px' }}>{renderDetailView()}</div>}
      {viewMode === 'edit' && currentEditItem && (
        <WorkflowEditor
          workflowKey={currentEditItem.key}
          workflowData={workflowData[currentEditItem.key]}
          initialValues={{
            name: currentEditItem.name,
            version: currentEditItem.version,
            description: currentEditItem.description,
          }}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}

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
