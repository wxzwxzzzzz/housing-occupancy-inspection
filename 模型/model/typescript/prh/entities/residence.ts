/**
 * 公租房保障监管 (cn.byteawake.prh) — 居住信息
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete, Fence } from '../../ap/oms';
import type { Resident } from './resident';
import type { ResidenceType, RecordStatus } from '../enums';
import type { PrhAddress } from '../structs';

/** 居住信息 */
export interface Residence extends OntologyObject, IAuditInfo, ITenant, ILogicDelete {
  /** 所属居民 */
  resident: Resident;
  /** 居住地址类型 */
  addressType: ResidenceType;
  /** 居住地址 */
  address: PrhAddress;
  /** 电子围栏 */
  fence?: Fence;
  /** 居住规律 */
  livingPattern?: string;
  /** 提醒开始时间 */
  reminderStart?: string;
  /** 提醒结束时间 */
  reminderEnd?: string;
  /** 是否监测目标 */
  isMonitoringTarget: boolean;
  /** 记录状态 */
  status: RecordStatus;
  /** 生效日期 */
  effectiveDate?: string;
  /** 归档日期 */
  archiveDate?: string;
  [key: string]: unknown;
}
