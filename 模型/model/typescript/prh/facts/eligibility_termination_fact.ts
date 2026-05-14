/**
 * 公租房保障监管 (cn.byteawake.prh) — 保障资格终止事实
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { EligibilityTermination } from '../entities/eligibility_termination';
import type { Household } from '../entities/household';
import type { ApplicationStatus, TerminationReason } from '../enums';
import type { ApprovalResult } from '../../ap/approval';

/** 保障资格终止事实 */
export interface EligibilityTerminationFact {
  /** 资格终止 */
  termination: EligibilityTermination;
  /** 所属家庭 */
  household: Household;
  /** 终止类型 */
  terminationType: TerminationReason;
  /** 申请状态 */
  terminationStatus: ApplicationStatus;
  /** 审批结果 */
  approvalResult?: ApprovalResult;
  /** 期望生效日期 */
  effectiveDate?: string;
  /** 资格终止申请数量 */
  terminationCount: number;
  /** 审批通过终止数量 */
  approvedTerminationCount: number;
  /** 审批拒绝终止数量 */
  rejectedTerminationCount: number;
  /** 审批退回终止数量 */
  returnedTerminationCount: number;
  /** 已取消终止数量 */
  cancelledTerminationCount: number;
  /** 审批中终止数量 */
  pendingTerminationCount: number;
  /** 平均审批小时数 */
  avgApprovalHours?: number;
}
