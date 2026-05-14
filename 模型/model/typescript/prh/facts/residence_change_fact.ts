/**
 * 公租房保障监管 (cn.byteawake.prh) — 居住地址变更事实
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { ResidenceChange } from '../entities/residence_change';
import type { Resident } from '../entities/resident';
import type { ApplicationStatus } from '../enums';
import type { ApprovalResult } from '../../ap/approval';

/** 居住地址变更事实 */
export interface ResidenceChangeFact {
  /** 居住地址变更 */
  residenceChange: ResidenceChange;
  /** 申请居民 */
  resident: Resident;
  /** 申请状态 */
  changeStatus: ApplicationStatus;
  /** 审批结果 */
  approvalResult?: ApprovalResult;
  /** 居住地址变更数量 */
  residenceChangeCount: number;
  /** 审批通过居住变更数量 */
  approvedResidenceChangeCount: number;
  /** 审批拒绝居住变更数量 */
  rejectedResidenceChangeCount: number;
  /** 审批退回居住变更数量 */
  returnedResidenceChangeCount: number;
  /** 平均审批小时数 */
  avgApprovalHours?: number;
}
