/**
 * 启元 (cn.byteawake.gp.arche) — 用户类型枚举
 * Generated from ontology/byteawake-gp-arche.cn.byteawake.gp.arche.xml
 */

/** 用户类型 */
export const UserType = {
  SYSTEM: 'SYSTEM',
  ROOT: 'ROOT',
  ENTERPRISE_ADMIN: 'ENTERPRISE_ADMIN',
  ISV: 'ISV',
  NORMAL: 'NORMAL',
} as const;
export type UserType = (typeof UserType)[keyof typeof UserType];
