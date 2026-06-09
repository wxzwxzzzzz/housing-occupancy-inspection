/**
 * 钉钉式竖向审批链 — 数据模型
 *
 * 整条流程是一个线性节点数组 FlowNode[]。
 * 条件分支节点(condition)内含多个分支,每个分支自身又是一段 FlowNode[],
 * 形成"链 + 树"的混合结构。设计器据此递归渲染。
 */

export type FlowNodeType =
  | 'start' // 发起人
  | 'approval' // 审批人
  | 'cc' // 抄送人
  | 'condition' // 条件分支
  | 'end'; // 结束

/** 多人审批时的会签 / 或签策略 */
export type ApprovalMode = 'and' | 'or';

/** 审批人来源 */
export interface ApprovalConfig {
  /** 审批角色/人员名称(展示用) */
  assignees: string[];
  /** 会签(全部通过) / 或签(一人通过) */
  mode: ApprovalMode;
  /** 处理时限(小时),超时提醒 */
  timeout?: number;
  /** 节点说明 */
  description?: string;
}

export interface StartConfig {
  /** 发起人/提交人范围 */
  submitter: string;
  description?: string;
}

export interface CcConfig {
  /** 抄送人 */
  ccUsers: string[];
  description?: string;
}

/** 条件分支中的单个分支 */
export interface ConditionBranch {
  id: string;
  /** 分支名称,如"金额>5万" */
  name: string;
  /** 优先级,数字越小越先匹配 */
  priority: number;
  /** 分支条件描述(展示用) */
  expr?: string;
  /** 是否为默认分支(其他条件都不满足时走此分支) */
  isDefault?: boolean;
  /** 分支内的子流程 */
  children: FlowNode[];
}

export interface ConditionConfig {
  branches: ConditionBranch[];
}

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  /** 节点标题,如"初审""主管审批" */
  title: string;
  config?: ApprovalConfig | StartConfig | CcConfig | ConditionConfig;
}

/** 设计器对外的完整图数据 */
export interface ApprovalChainGraph {
  /** schema 标识,便于与旧的 X6/LogicFlow 数据区分 */
  schema: 'approval-chain@1';
  nodes: FlowNode[];
}

export const isApprovalChainGraph = (g: unknown): g is ApprovalChainGraph =>
  !!g &&
  typeof g === 'object' &&
  (g as ApprovalChainGraph).schema === 'approval-chain@1' &&
  Array.isArray((g as ApprovalChainGraph).nodes);
