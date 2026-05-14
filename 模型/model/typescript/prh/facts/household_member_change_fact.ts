/**
 * 公租房保障监管 (cn.byteawake.prh) — 家庭成员变更事实
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { HouseholdMemberChange } from '../entities/household_member_change';
import type { Household } from '../entities/household';
import type { HouseholdMember } from '../entities/household_member';
import type { MemberChangeType, ApplicationStatus } from '../enums';
import type { ApprovalResult } from '../../ap/approval';

/** 家庭成员变更事实 */
export interface HouseholdMemberChangeFact {
  /** 家庭成员变更 */
  memberChange: HouseholdMemberChange;
  /** 所属家庭 */
  household: Household;
  /** 目标成员 */
  member?: HouseholdMember;
  /** 变更类型 */
  changeType: MemberChangeType;
  /** 申请状态 */
  changeStatus: ApplicationStatus;
  /** 审批结果 */
  approvalResult?: ApprovalResult;
  /** 目标成员关系 */
  memberRelationship?: string;
  /** 目标成员是否计入人口 */
  memberIncluded?: boolean;
  /** 成员变更数量 */
  memberChangeCount: number;
  /** 新增成员变更数量 */
  addMemberChangeCount: number;
  /** 移除成员变更数量 */
  removeMemberChangeCount: number;
  /** 审批通过成员变更数量 */
  approvedMemberChangeCount: number;
  /** 审批拒绝成员变更数量 */
  rejectedMemberChangeCount: number;
  /** 审批退回成员变更数量 */
  returnedMemberChangeCount: number;
  /** 平均审批小时数 */
  avgApprovalHours?: number;
}
