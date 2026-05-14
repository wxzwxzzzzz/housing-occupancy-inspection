/**
 * 公租房保障监管 (cn.byteawake.prh) — 考勤方案
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, IEnable, ILogicDelete } from '../../ap/oms';
import type { Calendar } from '../../ap/resource';

/** 考勤方案 */
export interface AttendanceSolution extends OntologyObject, IAuditInfo, ITenant, IEnable, ILogicDelete {
  /** 编码 */
  code: string;
  /** 名称 */
  name: string;
  /** 描述 */
  description?: string;
  /** 优先级 */
  priority?: number;
  /** 关联日历 */
  calendar: Calendar;
  [key: string]: unknown;
}
