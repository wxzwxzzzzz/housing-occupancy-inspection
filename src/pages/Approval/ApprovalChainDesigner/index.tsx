/**
 * 钉钉式竖向审批链设计器
 *
 * 纯 React + antd 实现,不依赖 X6 / LogicFlow。
 * - 竖向从上到下渲染审批链,节点间 + 号插入(审批人/抄送人/条件分支)
 * - 条件分支自动横向分列,列间用横线连成"川"字
 * - 点击节点在右侧 Drawer 配置;发起人/结束不可删
 */

import {
  ApartmentOutlined,
  BranchesOutlined,
  CloseOutlined,
  PlusOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Popover,
  Radio,
  Select,
  Space,
} from 'antd';
import React, { useMemo, useState } from 'react';
import {
  addBranch,
  createNode,
  insertNode,
  modeLabel,
  removeBranch,
  removeNode,
  updateBranch,
  updateNode,
  validateGraph,
} from './helpers';
import './index.less';
import type {
  ApprovalChainGraph,
  ApprovalConfig,
  CcConfig,
  ConditionBranch,
  ConditionConfig,
  FlowNode,
  FlowNodeType,
  StartConfig,
} from './types';

interface Props {
  /** 流程名称(标题展示) */
  workflowName?: string;
  /** 初始图数据 */
  graph: ApprovalChainGraph;
  onSave: (graph: ApprovalChainGraph) => void;
  onCancel: () => void;
  /** 只读模式(查看):隐藏增删、加号、保存,点击不可编辑 */
  readOnly?: boolean;
  /** 裸渲染:只输出审批链本体,不套 Card / 标题栏(供详情页嵌入) */
  bare?: boolean;
}

// 候选人员/角色(实际可从组织架构接口拉)
const ASSIGNEE_OPTIONS = [
  '初审员',
  '复审员',
  '审批主管',
  '审核员',
  '系统自动',
  '田鹏',
  '刘振伟',
  '裴晨宇',
  '赵艳',
];

const NODE_ICON: Record<FlowNodeType, React.ReactNode> = {
  start: <UserOutlined />,
  approval: <SolutionOutlined />,
  cc: <TeamOutlined />,
  condition: <BranchesOutlined />,
  end: <ApartmentOutlined />,
};

const ApprovalChainDesigner: React.FC<Props> = ({
  workflowName,
  graph,
  onSave,
  onCancel,
  readOnly = false,
  bare = false,
}) => {
  const [nodes, setNodes] = useState<FlowNode[]>(graph.nodes);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  const [editingBranch, setEditingBranch] = useState<ConditionBranch | null>(
    null,
  );
  const [form] = Form.useForm();
  const [branchForm] = Form.useForm();

  const errors = useMemo(
    () => validateGraph({ schema: 'approval-chain@1', nodes }),
    [nodes],
  );

  // ---- 增删节点 ----
  const handleAdd = (
    branchId: string | null,
    index: number,
    type: FlowNodeType,
  ) => {
    const node = createNode(type);
    setNodes((prev) => insertNode(prev, branchId, index, node));
  };

  const handleDeleteNode = (id: string) => {
    setNodes((prev) => removeNode(prev, id));
  };

  // ---- 打开节点配置 ----
  const openNodeConfig = (node: FlowNode) => {
    if (readOnly) return;
    if (node.type === 'end') return; // 结束节点无配置
    setEditingNode(node);
    setEditingBranch(null);
    const cfg = (node.config ?? {}) as Record<string, unknown>;
    form.setFieldsValue({ title: node.title, ...cfg });
    setDrawerOpen(true);
  };

  const openBranchConfig = (branch: ConditionBranch) => {
    if (readOnly) return;
    setEditingBranch(branch);
    setEditingNode(null);
    branchForm.setFieldsValue({
      name: branch.name,
      expr: branch.expr,
      priority: branch.priority,
    });
    setDrawerOpen(true);
  };

  const handleNodeSave = async () => {
    const values = await form.validateFields();
    if (editingNode) {
      const { title, ...config } = values;
      setNodes((prev) =>
        updateNode(prev, editingNode.id, {
          title,
          config: { ...editingNode.config, ...config },
        }),
      );
    }
    setDrawerOpen(false);
    message.success('节点已更新');
  };

  const handleBranchSave = async () => {
    const values = await branchForm.validateFields();
    if (editingBranch) {
      setNodes((prev) => updateBranch(prev, editingBranch.id, values));
    }
    setDrawerOpen(false);
    message.success('分支已更新');
  };

  const handleSave = () => {
    if (errors.length) {
      message.warning(`流程有 ${errors.length} 处问题待修正`);
      return;
    }
    onSave({ schema: 'approval-chain@1', nodes });
  };

  // ---- 渲染:节点卡片 ----
  const renderCard = (node: FlowNode) => {
    const deletable = !readOnly && node.type !== 'start' && node.type !== 'end';
    return (
      <div
        className={`acd-card type-${node.type}${readOnly ? '' : ' is-editable'}`}
        onClick={() => openNodeConfig(node)}
        style={readOnly ? { cursor: 'default' } : undefined}
      >
        <div className="acd-card-head">
          <span className="acd-card-icon">{NODE_ICON[node.type]}</span>
          <span>{node.title}</span>
        </div>
        <div className="acd-card-body">{renderCardBody(node)}</div>
        {deletable && (
          <div
            className="acd-card-del"
            title="删除节点"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteNode(node.id);
            }}
          >
            <CloseOutlined />
          </div>
        )}
      </div>
    );
  };

  const renderCardBody = (node: FlowNode) => {
    switch (node.type) {
      case 'start': {
        const c = node.config as StartConfig;
        return <span>{c?.submitter || '所有人'}</span>;
      }
      case 'approval': {
        const c = node.config as ApprovalConfig;
        if (!c?.assignees?.length)
          return <span className="acd-placeholder">请设置审批人</span>;
        return (
          <>
            <div>
              {c.assignees.map((a) => (
                <span key={a} className="acd-card-tag">
                  {a}
                </span>
              ))}
            </div>
            <div className="acd-card-meta">
              {modeLabel(c.mode)}
              {c.timeout ? ` · 限时 ${c.timeout}h` : ''}
            </div>
          </>
        );
      }
      case 'cc': {
        const c = node.config as CcConfig;
        if (!c?.ccUsers?.length)
          return <span className="acd-placeholder">请设置抄送人</span>;
        return (
          <div>
            {c.ccUsers.map((a) => (
              <span key={a} className="acd-card-tag">
                {a}
              </span>
            ))}
          </div>
        );
      }
      case 'end':
        return <span className="acd-placeholder">流程结束</span>;
      default:
        return null;
    }
  };

  // ---- 渲染:加号(插入节点) ----
  const renderConnector = (branchId: string | null, index: number) => {
    if (readOnly) return <div className="acd-connector" />;
    const content = (
      <Space direction="vertical" style={{ width: 132 }}>
        <Button
          block
          onClick={() => handleAdd(branchId, index, 'approval')}
        >
          审批
        </Button>
        <Button
          block
          onClick={() => handleAdd(branchId, index, 'cc')}
        >
          抄送
        </Button>
        <Button
          block
          onClick={() => handleAdd(branchId, index, 'condition')}
        >
          条件
        </Button>
      </Space>
    );
    return (
      <div className="acd-connector">
        <Popover content={content} trigger="click" placement="right">
          <span className="acd-add-btn" title="添加节点">
            <PlusOutlined />
          </span>
        </Popover>
      </div>
    );
  };

  // ---- 渲染:条件分支节点 ----
  const renderCondition = (node: FlowNode) => {
    const cfg = node.config as ConditionConfig;
    return (
      <div className="acd-condition">
        <div className="acd-cond-entry" onClick={() => openNodeConfig(node)}>
          <BranchesOutlined /> {node.title}
          {!readOnly && (
            <div
              className="acd-card-del"
              title="删除分支节点"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNode(node.id);
              }}
            >
              <CloseOutlined />
            </div>
          )}
        </div>
        <div className="acd-branches">
          {cfg.branches.map((branch) => (
            <div className="acd-branch-col" key={branch.id}>
              <div
                className="acd-branch-head"
                onClick={() => !branch.isDefault && openBranchConfig(branch)}
              >
                <span className="acd-branch-prio">
                  {branch.isDefault ? '默认' : `优先级${branch.priority}`}
                </span>
                <span className="acd-branch-name">{branch.name}</span>
                {branch.expr && (
                  <span className="acd-branch-expr">{branch.expr}</span>
                )}
                {!branch.isDefault && !readOnly && (
                  <span
                    className="acd-branch-del"
                    title="删除该分支"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNodes((prev) =>
                        removeBranch(prev, node.id, branch.id),
                      );
                    }}
                  >
                    <CloseOutlined />
                  </span>
                )}
              </div>
              {/* 分支内的子链 */}
              {renderChain(branch.children, branch.id)}
            </div>
          ))}
        </div>
        {!readOnly && (
          <Button
            className="acd-add-branch"
            size="small"
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => setNodes((prev) => addBranch(prev, node.id))}
          >
            分支
          </Button>
        )}
      </div>
    );
  };

  // ---- 渲染:一条链(主链或分支子链) ----
  const renderChain = (list: FlowNode[], branchId: string | null) => (
    <div className="acd-chain">
      {/* 分支子链:开头允许插入 */}
      {branchId !== null && renderConnector(branchId, 0)}
      {list.map((node, idx) => (
        <div className="acd-node-wrap" key={node.id}>
          {node.type === 'condition' ? renderCondition(node) : renderCard(node)}
          {/* 节点之后的连接线 + 加号(end 节点之后不加;主链 end 前是最后一个插入点) */}
          {node.type !== 'end' && renderConnector(branchId, idx + 1)}
        </div>
      ))}
    </div>
  );

  // 裸渲染:仅审批链本体(详情页嵌入,只读)
  if (bare) {
    return <div className="acd">{renderChain(nodes, null)}</div>;
  }

  return (
    <Card
      title={
        <Space>
          <span>流程设计</span>
          {workflowName && (
            <span style={{ color: '#888', fontWeight: 'normal' }}>
              · {workflowName}
            </span>
          )}
        </Space>
      }
      extra={
        <Space>
          <Button onClick={onCancel}>
            返回
          </Button>
          {!readOnly && (
            <Button type="primary" onClick={handleSave}>
              保存
            </Button>
          )}
        </Space>
      }
      styles={{ body: { padding: 0 } }}
    >
      {!readOnly && errors.length > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ margin: 16 }}
          message={`流程待完善(${errors.length})`}
          description={
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          }
        />
      )}

      <div className="acd">{renderChain(nodes, null)}</div>

      {/* 节点 / 分支 配置 Drawer */}
      <Drawer
        title={editingBranch ? '分支配置' : '节点配置'}
        placement="right"
        width={400}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button
              type="primary"
              onClick={editingBranch ? handleBranchSave : handleNodeSave}
            >
              确定
            </Button>
          </Space>
        }
      >
        {editingBranch ? (
          <Form form={branchForm} layout="vertical">
            <Form.Item
              label="分支名称"
              name="name"
              rules={[{ required: true, message: '请输入分支名称' }]}
            >
              <Input placeholder="如:金额大于5万" />
            </Form.Item>
            <Form.Item
              label="条件表达式"
              name="expr"
              extra="满足该条件时走此分支(展示用,实际由后端规则引擎解释)"
            >
              <Input placeholder="如:amount > 50000" />
            </Form.Item>
            <Form.Item label="优先级" name="priority">
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        ) : (
          editingNode && (
            <Form form={form} layout="vertical">
              <Form.Item
                label="节点名称"
                name="title"
                rules={[{ required: true, message: '请输入节点名称' }]}
              >
                <Input placeholder="如:初审 / 主管审批" />
              </Form.Item>

              {editingNode.type === 'start' && (
                <Form.Item label="提交人范围" name="submitter">
                  <Input placeholder="如:保障户" />
                </Form.Item>
              )}

              {editingNode.type === 'approval' && (
                <>
                  <Form.Item
                    label="审批人"
                    name="assignees"
                    rules={[{ required: true, message: '请选择审批人' }]}
                  >
                    <Select
                      mode="tags"
                      placeholder="选择或输入审批人/角色"
                      options={ASSIGNEE_OPTIONS.map((v) => ({
                        value: v,
                        label: v,
                      }))}
                    />
                  </Form.Item>
                  <Form.Item label="多人审批方式" name="mode">
                    <Radio.Group>
                      <Radio value="or">或签(一人通过)</Radio>
                      <Radio value="and">会签(全部通过)</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item label="处理时限(小时)" name="timeout">
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </>
              )}

              {editingNode.type === 'cc' && (
                <Form.Item
                  label="抄送人"
                  name="ccUsers"
                  rules={[{ required: true, message: '请选择抄送人' }]}
                >
                  <Select
                    mode="tags"
                    placeholder="选择或输入抄送人/角色"
                    options={ASSIGNEE_OPTIONS.map((v) => ({
                      value: v,
                      label: v,
                    }))}
                  />
                </Form.Item>
              )}

              {editingNode.type === 'condition' && (
                <Alert
                  type="info"
                  showIcon
                  message="在画布上点击各分支标题可编辑分支条件,点「添加分支」可增加分支。"
                />
              )}

              <Form.Item label="说明" name="description">
                <Input.TextArea rows={3} placeholder="节点处理说明(可选)" />
              </Form.Item>
            </Form>
          )
        )}
      </Drawer>
    </Card>
  );
};

export default ApprovalChainDesigner;
