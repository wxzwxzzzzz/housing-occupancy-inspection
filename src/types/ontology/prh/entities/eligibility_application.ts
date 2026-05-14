/**
 * 公租房保障监管 (cn.byteawake.prh) — 保障资质申请
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete } from '../../ap/oms';
import type { ISubmitInfo, IApprovalInfo, IApprovalFlow } from '../../ap/approval';
import type { Household } from './household';
import type { ApplicationType, GuaranteeType, ApplicationStatus } from '../enums';

/** 保障资质申请 */
export interface EligibilityApplication extends OntologyObject, IAuditInfo, ITenant, ILogicDelete, ISubmitInfo, IApprovalInfo, IApprovalFlow {
  /** 所属家庭 */
  household: Household;
  /** 申请类型 */
  applicationType: ApplicationType;
  /** 保障类型 */
  guaranteeType: GuaranteeType;
  /** 申请状态 */
  status: ApplicationStatus;
  /** 复审开始日期 */
  reviewStartDate?: string;
  /** 复审结束日期 */
  reviewEndDate?: string;
  [key: string]: unknown;
}
