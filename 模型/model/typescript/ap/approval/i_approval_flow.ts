/**
 * 审批公共接口 (cn.byteawake.gp.approval) — 审批流信息
 * Generated from ontology/byteawake-gp-approval.cn.byteawake.gp.approval.xml
 */

import type { User } from '../arche';

/** 审批流信息 */
export interface IApprovalFlow {
  /** 是否启用审批流 */
  approvalFlowEnabled?: boolean;
  /** 审批流状态 */
  verifyState?: number;
  /** 退回次数 */
  returnCount?: number;
  /** 流程实例 */
  processInstance?: string;
  /** 审批环节 */
  approvalStep?: string;
  /** 待审批人 */
  pendingApprover?: User;
  /** 任务 */
  task?: string;
}
