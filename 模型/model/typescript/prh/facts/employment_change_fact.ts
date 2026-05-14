/**
 * 公租房保障监管 (cn.byteawake.prh) — 工作地址变更事实
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { EmploymentChange } from '../entities/employment_change';
import type { Resident } from '../entities/resident';
import type { ApplicationStatus } from '../enums';
import type { ApprovalResult } from '../../ap/approval';

/** 工作地址变更事实 */
export interface EmploymentChangeFact {
  /** 工作地址变更 */
  employmentChange: EmploymentChange;
  /** 申请居民 */
  resident: Resident;
  /** 申请状态 */
  changeStatus: ApplicationStatus;
  /** 审批结果 */
  approvalResult?: ApprovalResult;
  /** 工作地址变更数量 */
  employmentChangeCount: number;
  /** 审批通过工作变更数量 */
  approvedEmploymentChangeCount: number;
  /** 审批拒绝工作变更数量 */
  rejectedEmploymentChangeCount: number;
  /** 审批退回工作变更数量 */
  returnedEmploymentChangeCount: number;
  /** 平均审批小时数 */
  avgApprovalHours?: number;
}
