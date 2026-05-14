/**
 * 公共元数据 (cn.byteawake.gp.oms) — 时间粒度枚举
 * Generated from ontology/byteawake-gp-oms.cn.byteawake.gp.oms.xml
 */

/** 时间粒度 */
export const TimeGrainKind = {
  DAY: 'DAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  QUARTER: 'QUARTER',
  YEAR: 'YEAR',
} as const;
export type TimeGrainKind = (typeof TimeGrainKind)[keyof typeof TimeGrainKind];
