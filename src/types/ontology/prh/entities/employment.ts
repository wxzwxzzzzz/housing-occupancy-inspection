/**
 * 公租房保障监管 (cn.byteawake.prh) — 工作信息
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete, Fence } from '../../ap/oms';
import type { Resident } from './resident';
import type { EmploymentAddressType, RecordStatus } from '../enums';
import type { PrhAddress } from '../structs';

/** 工作信息 */
export interface Employment extends OntologyObject, IAuditInfo, ITenant, ILogicDelete {
  /** 所属居民 */
  resident: Resident;
  /** 工作单位名称 */
  unitName: string;
  /** 工作地址类型 */
  addressType: EmploymentAddressType;
  /** 工作地址 */
  workAddress?: PrhAddress;
  /** 电子围栏 */
  fence?: Fence;
  /** 工作规律 */
  workPattern?: string;
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
