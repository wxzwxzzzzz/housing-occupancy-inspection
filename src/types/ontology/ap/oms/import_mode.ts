/**
 * 公共元数据 (cn.byteawake.gp.oms) — 导入模式枚举
 * Generated from ontology/byteawake-gp-oms.cn.byteawake.gp.oms.xml
 */

/** 导入模式 */
export const ImportMode = {
  UPSERT: 'UPSERT',
  INSERT_ONLY: 'INSERT_ONLY',
  UPDATE_ONLY: 'UPDATE_ONLY',
  VALIDATE_ONLY: 'VALIDATE_ONLY',
} as const;
export type ImportMode = (typeof ImportMode)[keyof typeof ImportMode];
