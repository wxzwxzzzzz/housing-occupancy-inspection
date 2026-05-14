/**
 * 公共元数据 (cn.byteawake.gp.oms) — 字段错误
 * Generated from ontology/byteawake-gp-oms.cn.byteawake.gp.oms.xml
 */

import type { OntologyLevelKind } from './ontology_level_kind';

/** 字段错误 */
export interface FieldError {
  /** 字段路径 */
  path: string;
  /** 错误消息 */
  message: string;
  /** 错误级别 */
  level?: OntologyLevelKind;
}
