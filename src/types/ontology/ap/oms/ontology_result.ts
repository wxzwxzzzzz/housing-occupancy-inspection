/**
 * 公共元数据 (cn.byteawake.gp.oms) — 操作结果
 * Generated from ontology/byteawake-gp-oms.cn.byteawake.gp.oms.xml
 */

import type { OntologyLevelKind } from './ontology_level_kind';

/** 操作结果 */
export interface OntologyResult {
  /** 是否成功 */
  success: boolean;
  /** 结果编码 */
  code: string;
  /** 结果消息 */
  message?: string;
  /** 详细消息 */
  detailMsg?: string;
  /** 结果级别 */
  level?: OntologyLevelKind;
  /** 追踪标识 */
  traceId?: string;
}
