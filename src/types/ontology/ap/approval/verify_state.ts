/**
 * 审批公共接口 (cn.byteawake.gp.approval) — 审批流状态枚举
 * Generated from ontology/byteawake-gp-approval.cn.byteawake.gp.approval.xml
 */

/** 审批流状态 */
export const VerifyState = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  RETURNED: 'RETURNED',
  CANCELLED: 'CANCELLED',
} as const;
export type VerifyState = (typeof VerifyState)[keyof typeof VerifyState];
