/**
 * 公租房保障监管 (cn.byteawake.prh) — 请假
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete } from '../../ap/oms';
import type { Resident } from './resident';
import type { LeaveType } from './leave_type';
import type { ApplicationStatus } from '../enums';

/** 请假 */
export interface Leave extends OntologyObject, IAuditInfo, ITenant, ILogicDelete {
  /** 请假居民 */
  resident: Resident;
  /** 请假类型 */
  leaveType: LeaveType;
  /** 开始日期 */
  startDate: string;
  /** 结束日期 */
  endDate: string;
  /** 请假原因 */
  reason?: string;
  /** 申请状态 */
  status: ApplicationStatus;
  [key: string]: unknown;
}
