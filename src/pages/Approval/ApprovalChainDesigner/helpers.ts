/**
 * 审批链树操作 helpers
 *
 * 流程是 FlowNode[],条件节点的分支里再嵌 FlowNode[]。
 * 所有增删改都返回新数组(不可变更新),便于 React 状态管理。
 */

import type {
  ApprovalChainGraph,
  ApprovalMode,
  ConditionBranch,
  FlowNode,
  FlowNodeType,
} from './types';

let seq = 0;
export const genId = (prefix = 'n'): string => {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${seq}`;
};

/** 新建一个指定类型的节点(带默认配置) */
export const createNode = (type: FlowNodeType): FlowNode => {
  switch (type) {
    case 'approval':
      return {
        id: genId('ap'),
        type,
        title: '审批人',
        config: { assignees: [], mode: 'or', timeout: 24 },
      };
    case 'cc':
      return {
        id: genId('cc'),
        type,
        title: '抄送人',
        config: { ccUsers: [] },
      };
    case 'condition':
      return {
        id: genId('cond'),
        type,
        title: '条件分支',
        config: {
          branches: [
            {
              id: genId('br'),
              name: '条件1',
              priority: 1,
              children: [],
            },
            {
              id: genId('br'),
              name: '其他',
              priority: 2,
              isDefault: true,
              children: [],
            },
          ],
        },
      };
    default:
      return { id: genId(), type, title: type };
  }
};

/** 空白流程:发起人 -> 结束 */
export const createEmptyGraph = (): ApprovalChainGraph => ({
  schema: 'approval-chain@1',
  nodes: [
    {
      id: genId('start'),
      type: 'start',
      title: '发起人',
      config: { submitter: '保障户' },
    },
    { id: genId('end'), type: 'end', title: '结束' },
  ],
});

/**
 * 在某个 list(主链或某分支的 children)的指定下标处插入节点。
 * 用 path 定位到目标 list:path 为分支 id 的数组,空数组表示主链。
 */

/** 在主链 / 分支链中,定位并返回可变操作的结果(纯函数,返回新树) */
const mapList = (
  nodes: FlowNode[],
  branchId: string | null,
  fn: (list: FlowNode[]) => FlowNode[],
): FlowNode[] => {
  // branchId 为 null:操作当前这层 list
  if (branchId === null) return fn(nodes);
  // 否则递归找到包含该 branchId 的条件节点
  return nodes.map((node) => {
    if (node.type === 'condition') {
      const cfg = node.config as { branches: ConditionBranch[] };
      const branches = cfg.branches.map((b) =>
        b.id === branchId
          ? { ...b, children: fn(b.children) }
          : { ...b, children: mapList(b.children, branchId, fn) },
      );
      return { ...node, config: { branches } };
    }
    return node;
  });
};

/** 在指定分支(branchId=null 为主链)的 index 处插入新节点 */
export const insertNode = (
  nodes: FlowNode[],
  branchId: string | null,
  index: number,
  newNode: FlowNode,
): FlowNode[] =>
  mapList(nodes, branchId, (list) => {
    const next = [...list];
    next.splice(index, 0, newNode);
    return next;
  });

/** 删除某个节点(按 id 在整棵树里找) */
export const removeNode = (nodes: FlowNode[], id: string): FlowNode[] =>
  nodes
    .filter((n) => n.id !== id)
    .map((node) => {
      if (node.type === 'condition') {
        const cfg = node.config as { branches: ConditionBranch[] };
        return {
          ...node,
          config: {
            branches: cfg.branches.map((b) => ({
              ...b,
              children: removeNode(b.children, id),
            })),
          },
        };
      }
      return node;
    });

/** 更新某个节点(标题 / 配置),按 id 在整棵树里找 */
export const updateNode = (
  nodes: FlowNode[],
  id: string,
  patch: Partial<FlowNode>,
): FlowNode[] =>
  nodes.map((node) => {
    if (node.id === id) return { ...node, ...patch };
    if (node.type === 'condition') {
      const cfg = node.config as { branches: ConditionBranch[] };
      return {
        ...node,
        config: {
          branches: cfg.branches.map((b) => ({
            ...b,
            children: updateNode(b.children, id, patch),
          })),
        },
      };
    }
    return node;
  });

/** 给条件节点新增一个分支 */
export const addBranch = (nodes: FlowNode[], conditionId: string): FlowNode[] =>
  nodes.map((node) => {
    if (node.id === conditionId && node.type === 'condition') {
      const cfg = node.config as { branches: ConditionBranch[] };
      // 新分支插在默认分支(其他)之前
      const defaultIdx = cfg.branches.findIndex((b) => b.isDefault);
      const insertAt = defaultIdx >= 0 ? defaultIdx : cfg.branches.length;
      const normalCount = cfg.branches.filter((b) => !b.isDefault).length;
      const branch: ConditionBranch = {
        id: genId('br'),
        name: `条件${normalCount + 1}`,
        priority: insertAt + 1,
        children: [],
      };
      const branches = [...cfg.branches];
      branches.splice(insertAt, 0, branch);
      return { ...node, config: { branches } };
    }
    if (node.type === 'condition') {
      const cfg = node.config as { branches: ConditionBranch[] };
      return {
        ...node,
        config: {
          branches: cfg.branches.map((b) => ({
            ...b,
            children: addBranch(b.children, conditionId),
          })),
        },
      };
    }
    return node;
  });

/** 删除条件节点的某个分支(不允许删到只剩 1 个) */
export const removeBranch = (
  nodes: FlowNode[],
  conditionId: string,
  branchId: string,
): FlowNode[] =>
  nodes.map((node) => {
    if (node.id === conditionId && node.type === 'condition') {
      const cfg = node.config as { branches: ConditionBranch[] };
      if (cfg.branches.length <= 2) return node; // 至少保留一个条件 + 默认
      return {
        ...node,
        config: { branches: cfg.branches.filter((b) => b.id !== branchId) },
      };
    }
    if (node.type === 'condition') {
      const cfg = node.config as { branches: ConditionBranch[] };
      return {
        ...node,
        config: {
          branches: cfg.branches.map((b) => ({
            ...b,
            children: removeBranch(b.children, conditionId, branchId),
          })),
        },
      };
    }
    return node;
  });

/** 更新某个分支的属性(名称 / 条件表达式 / 优先级) */
export const updateBranch = (
  nodes: FlowNode[],
  branchId: string,
  patch: Partial<ConditionBranch>,
): FlowNode[] =>
  nodes.map((node) => {
    if (node.type === 'condition') {
      const cfg = node.config as { branches: ConditionBranch[] };
      return {
        ...node,
        config: {
          branches: cfg.branches.map((b) =>
            b.id === branchId
              ? { ...b, ...patch }
              : { ...b, children: updateBranch(b.children, branchId, patch) },
          ),
        },
      };
    }
    return node;
  });

/** 校验流程:返回问题列表(空数组表示通过) */
export const validateGraph = (graph: ApprovalChainGraph): string[] => {
  const errors: string[] = [];
  const { nodes } = graph;
  if (!nodes.some((n) => n.type === 'start')) errors.push('缺少发起人节点');
  if (!nodes.some((n) => n.type === 'end')) errors.push('缺少结束节点');

  const walk = (list: FlowNode[]) => {
    for (const node of list) {
      if (node.type === 'approval') {
        const cfg = node.config as { assignees: string[] };
        if (!cfg?.assignees?.length) {
          errors.push(`审批节点「${node.title}」未设置审批人`);
        }
      }
      if (node.type === 'condition') {
        const cfg = node.config as { branches: ConditionBranch[] };
        cfg.branches.forEach((b) => {
          if (!b.isDefault && !b.expr) {
            errors.push(`分支「${b.name}」未设置条件`);
          }
          walk(b.children);
        });
      }
    }
  };
  walk(nodes);
  return errors;
};

export const modeLabel = (mode: ApprovalMode): string =>
  mode === 'and' ? '会签(全部通过)' : '或签(一人通过)';
