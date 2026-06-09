/**
 * 各业务流程的默认审批链模板
 *
 * 当一条流程还没有保存过 approval-chain 图数据时,按 flowKey 给出一个合理初始链。
 * 未匹配到的 flowKey 回退为空白链(发起人 -> 结束)。
 */

import { createEmptyGraph, genId } from './helpers';
import type { ApprovalChainGraph, FlowNode } from './types';

const start = (submitter: string): FlowNode => ({
  id: genId('start'),
  type: 'start',
  title: '发起人',
  config: { submitter },
});

const approval = (
  title: string,
  assignees: string[],
  mode: 'and' | 'or' = 'or',
): FlowNode => ({
  id: genId('ap'),
  type: 'approval',
  title,
  config: { assignees, mode, timeout: 24 },
});

const end = (): FlowNode => ({ id: genId('end'), type: 'end', title: '结束' });

const TEMPLATES: Record<string, () => ApprovalChainGraph> = {
  material: () => ({
    schema: 'approval-chain@1',
    nodes: [
      start('保障户'),
      approval('初审', ['初审员']),
      approval('复审', ['复审员']),
      approval('终审', ['审批主管']),
      end(),
    ],
  }),
  leave: () => ({
    schema: 'approval-chain@1',
    nodes: [start('保障户'), approval('主管审批', ['审批主管']), end()],
  }),
  filing: () => ({
    schema: 'approval-chain@1',
    nodes: [start('保障户'), approval('审核备案', ['审核员']), end()],
  }),
};

export const defaultChainFor = (flowKey: string): ApprovalChainGraph =>
  (TEMPLATES[flowKey] ?? createEmptyGraph)();
