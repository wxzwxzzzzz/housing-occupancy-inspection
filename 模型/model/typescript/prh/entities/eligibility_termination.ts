/**
 * 公租房保障监管 (cn.byteawake.prh) — 保障资格终止
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete } from '../../ap/oms';
import type { ISubmitInfo, IApprovalInfo, IApprovalFlow } from '../../ap/approval';
import type { Household } from './household';
import type { TerminationReason, ApplicationStatus } from '../enums';

/** 保障资格终止 */
export interface EligibilityTermination extends OntologyObject, IAuditInfo, ITenant, ILogicDelete, ISubmitInfo, IApprovalInfo, IApprovalFlow {
  /** 所属家庭 */
  household: Household;
  /** 终止类型 */
  terminationType: TerminationReason;
  /** 终止原因 */
  reason?: string;
  /** 期望生效日期 */
  effectiveDate?: string;
  /** 申请状态 */
  status: ApplicationStatus;
  [key: string]: unknown;
}
