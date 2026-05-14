/**
 * 审批公共接口 (cn.byteawake.gp.approval) — 审批信息
 * Generated from ontology/byteawake-gp-approval.cn.byteawake.gp.approval.xml
 */

import type { User } from '../arche';
import type { ApprovalResult } from './approval_result';

/** 审批信息 */
export interface IApprovalInfo {
  /** 审批人 */
  approver?: User;
  /** 审批时间 */
  approvalTime?: string;
  /** 审批意见 */
  approvalOpinion?: string;
  /** 审批结果 */
  approvalResult?: ApprovalResult;
}
