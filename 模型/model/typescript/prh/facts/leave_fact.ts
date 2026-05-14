/**
 * 公租房保障监管 (cn.byteawake.prh) — 请假事实
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { Leave } from '../entities/leave';
import type { Resident } from '../entities/resident';
import type { LeaveType } from '../entities/leave_type';
import type { ApplicationStatus } from '../enums';

/** 请假事实 */
export interface LeaveFact {
  /** 请假 */
  leave: Leave;
  /** 请假居民 */
  resident: Resident;
  /** 请假类型 */
  leaveType: LeaveType;
  /** 请假状态 */
  leaveStatus: ApplicationStatus;
  /** 开始日期 */
  startDate: string;
  /** 结束日期 */
  endDate: string;
  /** 请假数量 */
  leaveCount: number;
  /** 草稿请假数量 */
  draftLeaveCount: number;
  /** 审批中请假数量 */
  underApprovalLeaveCount: number;
  /** 已完成请假数量 */
  completedLeaveCount: number;
  /** 已取消请假数量 */
  cancelledLeaveCount: number;
  /** 请假天数 */
  leaveDays?: number;
  /** 已完成请假天数 */
  completedLeaveDays?: number;
}
