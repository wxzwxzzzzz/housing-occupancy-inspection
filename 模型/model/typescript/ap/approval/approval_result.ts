/**
 * 审批公共接口 (cn.byteawake.gp.approval) — 审批结果枚举
 * Generated from ontology/byteawake-gp-approval.cn.byteawake.gp.approval.xml
 */

/** 审批结果 */
export const ApprovalResult = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  RETURNED: 'RETURNED',
} as const;
export type ApprovalResult = (typeof ApprovalResult)[keyof typeof ApprovalResult];
