/**
 * 公租房保障监管 (cn.byteawake.prh) — 保障居民快照事实
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { Resident } from '../entities/resident';
import type { Gender, AgeGroup, MaritalStatus, GuaranteeType, ResidentStatus, TerminationReason } from '../enums';

/** 保障居民快照事实 */
export interface ResidentSnapshotFact {
  /** 保障居民 */
  resident: Resident;
  /** 性别 */
  gender?: Gender;
  /** 年龄分层 */
  ageGroup?: AgeGroup;
  /** 婚姻状况 */
  maritalStatus?: MaritalStatus;
  /** 保障类型 */
  guaranteeType?: GuaranteeType;
  /** 居民状态 */
  residentStatus?: ResidentStatus;
  /** 归档原因 */
  archiveReason?: TerminationReason;
  /** 归档日期 */
  archiveDate?: string;
  /** 居民数量 */
  residentCount: number;
  /** 草稿居民数量 */
  draftResidentCount: number;
  /** 未认证居民数量 */
  unverifiedResidentCount: number;
  /** 已认证居民数量 */
  verifiedResidentCount: number;
  /** 已激活居民数量 */
  activatedResidentCount: number;
  /** 已退出居民数量 */
  archivedResidentCount: number;
}
