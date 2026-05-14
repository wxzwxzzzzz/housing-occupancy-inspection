/**
 * 资源排班 (cn.byteawake.ap.resource) — 工作时段
 * Generated from ontology/byteawake-ap-resource.cn.byteawake.ap.resource.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete, IEnable } from '../../ap/oms';
import type { Calendar } from './calendar';
import type { Weekday } from './weekday';
import type { DayPeriod } from './day_period';
import type { WeekType } from './week_type';

/** 工作时段 */
export interface CalendarAttendance extends OntologyObject, IAuditInfo, ITenant, ILogicDelete, IEnable {
  /** 所属日历 */
  calendar: Calendar;
  /** 名称 */
  name: string;
  /** 星期 */
  dayOfWeek: Weekday;
  /** 开始小时 */
  hourFrom: number;
  /** 结束小时 */
  hourTo: number;
  /** 日内时段 */
  dayPeriod?: DayPeriod;
  /** 双周类型 */
  weekType?: WeekType;
  /** 序号 */
  ordinal?: number;
  [key: string]: unknown;
}
