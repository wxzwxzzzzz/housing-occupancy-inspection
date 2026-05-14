/**
 * 公租房保障监管 (cn.byteawake.prh) — 补卡申请事实
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { AttendanceMakeup } from '../entities/attendance_makeup';
import type { Attendance } from '../entities/attendance';
import type { Resident } from '../entities/resident';
import type { AttendanceType, AttendanceStatus, ApplicationStatus } from '../enums';
import type { ApprovalResult } from '../../ap/approval';

/** 补卡申请事实 */
export interface AttendanceMakeupFact {
  /** 补卡申请 */
  makeup: AttendanceMakeup;
  /** 申请居民 */
  resident: Resident;
  /** 目标考勤 */
  targetAttendance: Attendance;
  /** 补卡状态 */
  makeupStatus: ApplicationStatus;
  /** 审批结果 */
  approvalResult?: ApprovalResult;
  /** 提交时间 */
  submittedAt?: string;
  /** 审批时间 */
  approvalTime?: string;
  /** 目标考勤类型 */
  targetAttendanceType: AttendanceType;
  /** 目标考勤状态 */
  targetAttendanceStatus: AttendanceStatus;
  /** 补卡申请数量 */
  makeupCount: number;
  /** 审批通过补卡数量 */
  approvedMakeupCount: number;
  /** 审批拒绝补卡数量 */
  rejectedMakeupCount: number;
  /** 审批退回补卡数量 */
  returnedMakeupCount: number;
  /** 已取消补卡数量 */
  cancelledMakeupCount: number;
  /** 平均审批小时数 */
  avgApprovalHours?: number;
}
