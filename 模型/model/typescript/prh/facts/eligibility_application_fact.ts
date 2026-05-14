/**
 * 公租房保障监管 (cn.byteawake.prh) — 保障资质申请事实
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { EligibilityApplication } from '../entities/eligibility_application';
import type { Household } from '../entities/household';
import type { ApplicationType, GuaranteeType, ApplicationStatus } from '../enums';
import type { ApprovalResult } from '../../ap/approval';

/** 保障资质申请事实 */
export interface EligibilityApplicationFact {
  /** 资质申请 */
  application: EligibilityApplication;
  /** 所属家庭 */
  household: Household;
  /** 申请类型 */
  applicationType: ApplicationType;
  /** 保障类型 */
  guaranteeType: GuaranteeType;
  /** 申请状态 */
  applicationStatus: ApplicationStatus;
  /** 审批结果 */
  approvalResult?: ApprovalResult;
  /** 审批环节 */
  approvalStep?: string;
  /** 提交时间 */
  submittedAt?: string;
  /** 审批时间 */
  approvalTime?: string;
  /** 复审开始日期 */
  reviewStartDate?: string;
  /** 复审结束日期 */
  reviewEndDate?: string;
  /** 资质申请数量 */
  applicationCount: number;
  /** 已提交资质申请数量 */
  submittedApplicationCount: number;
  /** 审批中资质申请数量 */
  underApprovalApplicationCount: number;
  /** 已完成资质申请数量 */
  completedApplicationCount: number;
  /** 已取消资质申请数量 */
  cancelledApplicationCount: number;
  /** 审批通过资质申请数量 */
  approvedApplicationCount: number;
  /** 审批拒绝资质申请数量 */
  rejectedApplicationCount: number;
  /** 审批退回资质申请数量 */
  returnedApplicationCount: number;
  /** 平均审批小时数 */
  avgApprovalHours?: number;
}
