/**
 * 公租房保障监管 (cn.byteawake.prh) — 保障家庭
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete } from '../../ap/oms';
import type { Resident } from './resident';
import type { GuaranteeType, HouseholdStatus, TerminationReason } from '../enums';

/** 保障家庭 */
export interface Household extends OntologyObject, IAuditInfo, ITenant, ILogicDelete {
  /** 申请人姓名 */
  applicantName: string;
  /** 保障类型 */
  guaranteeType: GuaranteeType;
  /** 家庭人口数 */
  householdSize: number;
  /** 家庭状态 */
  status: HouseholdStatus;
  /** 当前申请单标识 */
  activeApplicationId?: string;
  /** 主申请人 */
  applicant: Resident;
  /** 归档原因 */
  archiveReason?: TerminationReason;
  /** 归档日期 */
  archiveDate?: string;
  /** 归档备注 */
  archiveNote?: string;
  /** 轮候序号 */
  waitlistNo?: number;
  [key: string]: unknown;
}
