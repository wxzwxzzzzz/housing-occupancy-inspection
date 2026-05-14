/**
 * 启元 (cn.byteawake.gp.arche) — 租户状态枚举
 * Generated from ontology/byteawake-gp-arche.cn.byteawake.gp.arche.xml
 */

/** 租户状态 */
export const TenantStatus = {
  ACTIVE: 'ACTIVE',
  STOPPED: 'STOPPED',
  EXPIRED: 'EXPIRED',
} as const;
export type TenantStatus = (typeof TenantStatus)[keyof typeof TenantStatus];
