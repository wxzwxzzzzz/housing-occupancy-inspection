/**
 * 启元 (cn.byteawake.gp.arche) — 企业状态枚举
 * Generated from ontology/byteawake-gp-arche.cn.byteawake.gp.arche.xml
 */

/** 企业状态 */
export const EnterpriseState = {
  REGISTERED: 'REGISTERED',
  AUTHENTICATED: 'AUTHENTICATED',
  REJECTED: 'REJECTED',
} as const;
export type EnterpriseState = (typeof EnterpriseState)[keyof typeof EnterpriseState];
