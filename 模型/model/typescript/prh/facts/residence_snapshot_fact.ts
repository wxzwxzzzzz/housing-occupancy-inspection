/**
 * 公租房保障监管 (cn.byteawake.prh) — 居住信息快照事实
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { Residence } from '../entities/residence';
import type { Resident } from '../entities/resident';
import type { RecordStatus, ResidenceType } from '../enums';
import type { AdministrativeRegion } from '../../ap/basedoc';

/** 居住信息快照事实 */
export interface ResidenceSnapshotFact {
  /** 居住信息 */
  residence: Residence;
  /** 保障居民 */
  resident: Resident;
  /** 居住地址类型 */
  residenceType: ResidenceType;
  /** 居住行政区划 */
  residenceRegion?: AdministrativeRegion;
  /** 是否监测目标 */
  monitoringTarget: boolean;
  /** 记录状态 */
  recordStatus: RecordStatus;
  /** 生效日期 */
  effectiveDate?: string;
  /** 归档日期 */
  archiveDate?: string;
  /** 居住记录数量 */
  residenceRecordCount: number;
  /** 生效居住记录数量 */
  activeResidenceRecordCount: number;
  /** 归档居住记录数量 */
  archivedResidenceRecordCount: number;
  /** 监测目标居住记录数量 */
  monitoringResidenceCount: number;
}
