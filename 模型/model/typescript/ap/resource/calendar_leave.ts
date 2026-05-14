/**
 * 资源排班 (cn.byteawake.ap.resource) — 日历休班
 * Generated from ontology/byteawake-ap-resource.cn.byteawake.ap.resource.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete, IEnable } from '../../ap/oms';
import type { Calendar } from './calendar';
import type { Resource } from './resource';
import type { LeaveEffect } from './leave_effect';
import type { TimeType } from './time_type';

/** 日历休班 */
export interface CalendarLeave extends OntologyObject, IAuditInfo, ITenant, ILogicDelete, IEnable {
  /** 所属日历 */
  calendar?: Calendar;
  /** 所属资源 */
  resource?: Resource;
  /** 名称 */
  name: string;
  /** 开始时间 */
  dateFrom: string;
  /** 结束时间 */
  dateTo: string;
  /** 休班效果 */
  effect: LeaveEffect;
  /** 时间类型 */
  timeType?: TimeType;
  /** 描述 */
  description?: string;
  [key: string]: unknown;
}
