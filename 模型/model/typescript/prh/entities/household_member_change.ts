/**
 * 公租房保障监管 (cn.byteawake.prh) — 家庭成员变更
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete } from '../../ap/oms';
import type { ISubmitInfo, IApprovalInfo, IApprovalFlow } from '../../ap/approval';
import type { Household } from './household';
import type { HouseholdMember } from './household_member';
import type { MemberChangeType, ApplicationStatus } from '../enums';

/** 家庭成员变更 */
export interface HouseholdMemberChange extends OntologyObject, IAuditInfo, ITenant, ILogicDelete, ISubmitInfo, IApprovalInfo, IApprovalFlow {
  /** 所属家庭 */
  household: Household;
  /** 变更类型 */
  changeType: MemberChangeType;
  /** 变更原因 */
  reason?: string;
  /** 申请状态 */
  status: ApplicationStatus;
  /** 目标成员 */
  member?: HouseholdMember;
  [key: string]: unknown;
}
