/**
 * 公租房保障监管 (cn.byteawake.prh) — 家庭成员快照事实
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { HouseholdMember } from '../entities/household_member';
import type { Household } from '../entities/household';
import type { Resident } from '../entities/resident';
import type { GuaranteeType, HouseholdStatus, ResidentStatus } from '../enums';

/** 家庭成员快照事实 */
export interface HouseholdMemberSnapshotFact {
  /** 家庭成员 */
  member: HouseholdMember;
  /** 所属家庭 */
  household: Household;
  /** 关联居民 */
  resident?: Resident;
  /** 与申请人关系 */
  relationship?: string;
  /** 是否计入家庭人口 */
  included: boolean;
  /** 加入时间 */
  joinedAt?: string;
  /** 家庭保障类型 */
  householdGuaranteeType: GuaranteeType;
  /** 家庭状态 */
  householdStatus: HouseholdStatus;
  /** 居民状态 */
  residentStatus?: ResidentStatus;
  /** 成员数量 */
  memberCount: number;
  /** 计入人口成员数量 */
  includedMemberCount: number;
  /** 不计入人口成员数量 */
  excludedMemberCount: number;
  /** 已关联居民成员数量 */
  linkedResidentMemberCount: number;
}
