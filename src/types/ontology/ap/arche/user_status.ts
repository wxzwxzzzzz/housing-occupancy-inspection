/**
 * 启元 (cn.byteawake.gp.arche) — 用户状态枚举
 * Generated from ontology/byteawake-gp-arche.cn.byteawake.gp.arche.xml
 */

/** 用户状态 */
export const UserStatus = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
  INACTIVE: 'INACTIVE',
  CANCELLED: 'CANCELLED',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
