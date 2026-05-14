/**
 * 公租房保障监管 (cn.byteawake.prh) — 补卡申请
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete } from '../../ap/oms';
import type { ISubmitInfo, IApprovalInfo, IApprovalFlow } from '../../ap/approval';
import type { Resident } from './resident';
import type { Attendance } from './attendance';
import type { ApplicationStatus } from '../enums';

/** 补卡申请 */
export interface AttendanceMakeup extends OntologyObject, IAuditInfo, ITenant, ILogicDelete, ISubmitInfo, IApprovalInfo, IApprovalFlow {
  /** 申请居民 */
  resident: Resident;
  /** 关联打卡 */
  targetAttendance: Attendance;
  /** 补卡原因 */
  reason: string;
  /** 申请状态 */
  status: ApplicationStatus;
  [key: string]: unknown;
}
