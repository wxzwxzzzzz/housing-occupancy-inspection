/**
 * 公租房保障监管 (cn.byteawake.prh) — 考勤打卡
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, GeoPoint, Attachment } from '../../ap/oms';
import type { Resident } from './resident';
import type { AttendanceType, AttendanceStatus, AttendanceMode } from '../enums';

/** 考勤打卡 */
export interface Attendance extends OntologyObject, IAuditInfo, ITenant {
  /** 打卡居民 */
  resident: Resident;
  /** 出勤类型 */
  attendanceType: AttendanceType;
  /** 打卡时间 */
  checkIn: string;
  /** 应打卡截止 */
  deadline: string;
  /** 人脸识别照片 */
  face?: Attachment;
  /** 环境视频 */
  environment?: Attachment;
  /** 地理坐标 */
  location?: GeoPoint;
  /** 设备标识 */
  deviceId?: string;
  /** 打卡IP */
  ipAddress?: string;
  /** 客户端UA */
  browser?: string;
  /** 打卡方式 */
  mode: AttendanceMode;
  /** 考勤状态 */
  status: AttendanceStatus;
  [key: string]: unknown;
}
