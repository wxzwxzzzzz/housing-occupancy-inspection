/**
 * 资源排班 (cn.byteawake.ap.resource) — 资源
 * Generated from ontology/byteawake-ap-resource.cn.byteawake.ap.resource.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete, IEnable } from '../../ap/oms';
import type { ResourceType } from './resource_type';
import type { Calendar } from './calendar';

/** 资源 */
export interface Resource extends OntologyObject, IAuditInfo, ITenant, ILogicDelete, IEnable {
  /** 编码 */
  code: string;
  /** 名称 */
  name: string;
  /** 资源类型 */
  resourceType: ResourceType;
  /** 默认日历 */
  calendar?: Calendar;
  /** 时区 */
  timezone?: string;
  /** 效率因子 */
  efficiencyFactor?: number;
  [key: string]: unknown;
}
