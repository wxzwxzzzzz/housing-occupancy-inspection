/**
 * 公租房保障监管 (cn.byteawake.prh) — 结构体
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { AdministrativeRegion } from '../ap/basedoc';
import type { GeoPoint } from '../ap/oms';

// ============================================================================
// 结构体
// ============================================================================

/** 地址 */
export interface PrhAddress {
  /** 行政区划 */
  region: AdministrativeRegion;
  /** 详细地址 */
  detail: string;
  /** 定位坐标 */
  geoPoint?: GeoPoint;
}
