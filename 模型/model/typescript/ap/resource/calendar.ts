/**
 * 资源排班 (cn.byteawake.ap.resource) — 资源日历
 * Generated from ontology/byteawake-ap-resource.cn.byteawake.ap.resource.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete, IEnable } from '../../ap/oms';
import type { ScheduleType } from './schedule_type';

/** 资源日历 */
export interface Calendar extends OntologyObject, IAuditInfo, ITenant, ILogicDelete, IEnable {
  /** 编码 */
  code: string;
  /** 名称 */
  name: string;
  /** 时区 */
  timezone?: string;
  /** 每日小时数 */
  hoursPerDay?: number;
  /** 每周小时数 */
  hoursPerWeek?: number;
  /** 调度类型 */
  scheduleType: ScheduleType;
  /** 双周日历 */
  twoWeeksCalendar?: boolean;
  /** 描述 */
  description?: string;
  [key: string]: unknown;
}
