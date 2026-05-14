/**
 * 启元 (cn.byteawake.gp.arche) — 邮箱变更状态枚举
 * Generated from ontology/byteawake-gp-arche.cn.byteawake.gp.arche.xml
 */

/** 邮箱变更状态 */
export const EmailChangeStatus = {
  NONE: 'NONE',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
} as const;
export type EmailChangeStatus = (typeof EmailChangeStatus)[keyof typeof EmailChangeStatus];
