/**
 * 公租房保障监管 (cn.byteawake.prh) — 保障家庭快照事实
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { Household } from '../entities/household';
import type { HouseholdMember } from '../entities/household_member';
import type { Resident } from '../entities/resident';
import type {
  GuaranteeType,
  HouseholdStatus,
  HouseholdSizeBand,
  TerminationReason,
  Gender,
  AgeGroup,
  MaritalStatus,
  ResidentStatus,
} from '../enums';

/** 保障家庭快照事实 */
export interface HouseholdSnapshotFact {
  /** 保障家庭 */
  household: Household;
  /** 保障类型 */
  guaranteeType: GuaranteeType;
  /** 家庭状态 */
  householdStatus: HouseholdStatus;
  /** 家庭人口数 */
  householdSize: number;
  /** 家庭人口规模分层 */
  householdSizeBand: HouseholdSizeBand;
  /** 轮候序号 */
  waitlistNo?: number;
  /** 归档原因 */
  archiveReason?: TerminationReason;
  /** 归档日期 */
  archiveDate?: string;
  /** 建档时间 */
  createdAt: string;
  /** 最近修改时间 */
  modifiedAt: string;
  /** 主申请人 */
  applicant: Resident;
  /** 主申请人性别 */
  applicantGender?: Gender;
  /** 主申请人年龄分层 */
  applicantAgeGroup?: AgeGroup;
  /** 主申请人婚姻状况 */
  applicantMaritalStatus?: MaritalStatus;
  /** 主申请人居民状态 */
  applicantResidentStatus?: ResidentStatus;
  /** 家庭数量 */
  householdCount: number;
  /** 在保家庭数量 */
  activeHouseholdCount: number;
  /** 候选家庭数量 */
  candidateHouseholdCount: number;
  /** 已退出家庭数量 */
  archivedHouseholdCount: number;
  /** 草稿家庭数量 */
  draftHouseholdCount: number;
  /** 系统内家庭人口数 */
  totalHouseholdPopulation: number;
  /** 在保家庭人口数 */
  activeHouseholdPopulation: number;
  /** 候选家庭人口数 */
  candidateHouseholdPopulation: number;
  /** 已退出家庭人口数 */
  archivedHouseholdPopulation: number;
  /** 在保家庭平均人口数 */
  avgActiveHouseholdSize?: number;
  /** 候选家庭平均人口数 */
  avgCandidateHouseholdSize?: number;
}
