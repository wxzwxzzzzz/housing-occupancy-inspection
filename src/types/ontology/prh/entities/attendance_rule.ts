/**
 * 公租房保障监管 (cn.byteawake.prh) — 考勤规则
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete } from '../../ap/oms';
import type { AttendanceSolution } from './attendance_solution';
import type { AttendanceType, AttendancePeriod } from '../enums';

/** 考勤规则 */
export interface AttendanceRule extends OntologyObject, IAuditInfo, ITenant, ILogicDelete {
  /** 所属方案 */
  solution: AttendanceSolution;
  /** 出勤类型 */
  attendanceType: AttendanceType;
  /** 打卡次数 */
  checkInCount: number;
  /** 考核周期 */
  period: AttendancePeriod;
  [key: string]: unknown;
}
