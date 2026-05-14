/**
 * 公共元数据 (cn.byteawake.gp.oms) — 围栏顶点
 * Generated from ontology/byteawake-gp-oms.cn.byteawake.gp.oms.xml
 */

import type { OntologyObject } from './ontology_object';
import type { ITenant } from './i_tenant';
import type { IAuditInfo } from './i_audit_info';
import type { Fence } from './fence';
import type { GeoPoint } from './geo_point';

/** 围栏顶点 */
export interface FenceVertex extends OntologyObject, ITenant, IAuditInfo {
  /** 所属围栏 */
  fence: Fence;
  /** 顶点序号 */
  ordinal: number;
  /** 顶点坐标 */
  point: GeoPoint;
}
