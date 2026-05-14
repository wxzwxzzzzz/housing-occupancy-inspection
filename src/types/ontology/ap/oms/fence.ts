/**
 * 公共元数据 (cn.byteawake.gp.oms) — 电子围栏
 * Generated from ontology/byteawake-gp-oms.cn.byteawake.gp.oms.xml
 */

import type { OntologyObject } from './ontology_object';
import type { ILogicDelete } from './i_logic_delete';
import type { ITenant } from './i_tenant';
import type { IAuditInfo } from './i_audit_info';
import type { FenceType } from './fence_type';
import type { GeoPoint } from './geo_point';

/** 电子围栏 */
export interface Fence extends OntologyObject, ILogicDelete, ITenant, IAuditInfo {
  /** 围栏类型 */
  fenceType: FenceType;
  /** 中心坐标 */
  center?: GeoPoint;
  /** 半径 */
  radius?: number;
}
