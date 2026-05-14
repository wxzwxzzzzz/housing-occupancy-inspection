/**
 * 公共元数据 (cn.byteawake.gp.oms) — 级别类别枚举
 * Generated from ontology/byteawake-gp-oms.cn.byteawake.gp.oms.xml
 */

/** 级别类别 */
export const OntologyLevelKind = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL',
} as const;
export type OntologyLevelKind = (typeof OntologyLevelKind)[keyof typeof OntologyLevelKind];
