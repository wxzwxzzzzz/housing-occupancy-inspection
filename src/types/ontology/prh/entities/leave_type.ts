/**
 * 公租房保障监管 (cn.byteawake.prh) — 请假类型
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, IEnable } from '../../ap/oms';
import type { TimeType } from '../../ap/resource';

/** 请假类型 */
export interface LeaveType extends OntologyObject, IAuditInfo, ITenant, IEnable {
  /** 类型名称 */
  name: string;
  /** 时间类型 */
  timeType?: TimeType;
  /** 需要证明材料 */
  supportDoc?: boolean;
  [key: string]: unknown;
}
