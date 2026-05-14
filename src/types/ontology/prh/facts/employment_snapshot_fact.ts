/**
 * 公租房保障监管 (cn.byteawake.prh) — 工作信息快照事实
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { Employment } from '../entities/employment';
import type { Resident } from '../entities/resident';
import type { EmploymentAddressType, RecordStatus } from '../enums';
import type { AdministrativeRegion } from '../../ap/basedoc';

/** 工作信息快照事实 */
export interface EmploymentSnapshotFact {
  /** 工作信息 */
  employment: Employment;
  /** 保障居民 */
  resident: Resident;
  /** 工作地址类型 */
  employmentAddressType: EmploymentAddressType;
  /** 工作行政区划 */
  employmentRegion?: AdministrativeRegion;
  /** 是否监测目标 */
  monitoringTarget: boolean;
  /** 记录状态 */
  recordStatus: RecordStatus;
  /** 生效日期 */
  effectiveDate?: string;
  /** 归档日期 */
  archiveDate?: string;
  /** 工作记录数量 */
  employmentRecordCount: number;
  /** 生效工作记录数量 */
  activeEmploymentRecordCount: number;
  /** 归档工作记录数量 */
  archivedEmploymentRecordCount: number;
  /** 监测目标工作记录数量 */
  monitoringEmploymentCount: number;
}
