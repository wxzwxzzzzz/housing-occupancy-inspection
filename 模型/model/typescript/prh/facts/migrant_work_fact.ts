/**
 * 公租房保障监管 (cn.byteawake.prh) — 外出务工申请事实
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { MigrantWork } from '../entities/migrant_work';
import type { Resident } from '../entities/resident';
import type { ApplicationStatus } from '../enums';
import type { ApprovalResult } from '../../ap/approval';

/** 外出务工申请事实 */
export interface MigrantWorkFact {
  /** 外出务工申请 */
  migrantWork: MigrantWork;
  /** 申请居民 */
  resident: Resident;
  /** 申请状态 */
  migrantWorkStatus: ApplicationStatus;
  /** 审批结果 */
  approvalResult?: ApprovalResult;
  /** 开始日期 */
  startDate: string;
  /** 结束日期 */
  endDate?: string;
  /** 外出务工申请数量 */
  migrantWorkCount: number;
  /** 审批通过外出务工数量 */
  approvedMigrantWorkCount: number;
  /** 审批拒绝外出务工数量 */
  rejectedMigrantWorkCount: number;
  /** 审批退回外出务工数量 */
  returnedMigrantWorkCount: number;
  /** 平均务工天数 */
  avgMigrantWorkDays?: number;
  /** 平均审批小时数 */
  avgApprovalHours?: number;
}
