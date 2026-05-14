/**
 * 公共元数据 (cn.byteawake.gp.oms) — 围栏类型枚举
 * Generated from ontology/byteawake-gp-oms.cn.byteawake.gp.oms.xml
 */

/** 围栏类型 */
export const FenceType = {
  CIRCLE: 'CIRCLE',
  POLYGON: 'POLYGON',
} as const;
export type FenceType = (typeof FenceType)[keyof typeof FenceType];
