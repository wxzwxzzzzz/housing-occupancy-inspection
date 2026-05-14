/**
 * 基础档案 (cn.byteawake.ap.basedoc) — 行政区划
 * Generated from ontology/byteawake-ap-basedoc.cn.byteawake.ap.basedoc.xml
 */

import type {
  OntologyObject,
  IAuditInfo,
  ITenant,
  ILogicDelete,
  IEnable,
  ISysPreset,
  ITimeline,
  ITree,
} from '../../ap/oms';
import type { RegionType } from './region_type';

/** 行政区划 */
export interface AdministrativeRegion extends OntologyObject, IAuditInfo, ITenant, ILogicDelete, IEnable, ISysPreset, ITimeline, ITree {
  /** 编码 */
  code: string;
  /** 国标码 */
  nationalCode: string;
  /** 国家码 */
  countryCode: string;
  /** 区划类型 */
  regionType: RegionType;
  /** 简称 */
  shortName?: string;
  /** 拼音 */
  pinyin?: string;
  /** 拼音缩写 */
  pinyinShort?: string;
  /** 中心点经度 */
  longitude?: number;
  /** 中心点纬度 */
  latitude?: number;
  [key: string]: unknown;
}
