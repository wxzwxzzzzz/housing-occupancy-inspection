/**
 * 公共元数据 (cn.byteawake.gp.oms) — 数据集类别枚举
 * Generated from ontology/byteawake-gp-oms.cn.byteawake.gp.oms.xml
 */

/** 数据集类别 */
export const DataSetKind = {
  ONTOLOGY_OBJECT: 'ONTOLOGY_OBJECT',
  PHYSICAL_TABLE: 'PHYSICAL_TABLE',
} as const;
export type DataSetKind = (typeof DataSetKind)[keyof typeof DataSetKind];
