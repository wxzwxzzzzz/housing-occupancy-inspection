/**
 * 公共元数据 (cn.byteawake.gp.oms) — 可加性枚举
 * Generated from ontology/byteawake-gp-oms.cn.byteawake.gp.oms.xml
 */

/** 可加性 */
export const AdditivityKind = {
  ADDITIVE: 'ADDITIVE',
  SEMI_ADDITIVE: 'SEMI_ADDITIVE',
  NON_ADDITIVE: 'NON_ADDITIVE',
} as const;
export type AdditivityKind = (typeof AdditivityKind)[keyof typeof AdditivityKind];
