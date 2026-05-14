/**
 * 公租房保障监管 (cn.byteawake.prh) — 考勤打卡事实
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { Attendance } from '../entities/attendance';
import type { Resident } from '../entities/resident';
import type { AttendanceType, AttendanceMode, AttendanceStatus, AttendanceTimeliness } from '../enums';

/** 考勤打卡事实 */
export interface AttendanceFact {
  /** 考勤打卡 */
  attendance: Attendance;
  /** 打卡居民 */
  resident: Resident;
  /** 出勤类型 */
  attendanceType: AttendanceType;
  /** 打卡方式 */
  attendanceMode: AttendanceMode;
  /** 考勤状态 */
  attendanceStatus: AttendanceStatus;
  /** 打卡时间 */
  checkIn: string;
  /** 应打卡截止 */
  deadline: string;
  /** 考勤准时性 */
  attendanceTimeliness: AttendanceTimeliness;
  /** 考勤任务数量 */
  attendanceCount: number;
  /** 应打卡数量 */
  requiredAttendanceCount: number;
  /** 有效打卡数量 */
  validAttendanceCount: number;
  /** 无效打卡数量 */
  invalidAttendanceCount: number;
  /** 缺勤数量 */
  missedAttendanceCount: number;
  /** 豁免数量 */
  exemptedAttendanceCount: number;
  /** 待打卡数量 */
  pendingAttendanceCount: number;
  /** 补卡方式打卡数量 */
  makeupAttendanceCount: number;
}
