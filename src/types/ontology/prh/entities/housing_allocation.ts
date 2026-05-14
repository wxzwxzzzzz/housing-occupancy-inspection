/**
 * 公租房保障监管 (cn.byteawake.prh) — 实物配租
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete } from '../../ap/oms';
import type { Household } from './household';
import type { AllocationStatus } from '../enums';

/** 实物配租 */
export interface HousingAllocation extends OntologyObject, IAuditInfo, ITenant, ILogicDelete {
  /** 所属家庭 */
  household: Household;
  /** 项目名称 */
  projectName: string;
  /** 楼栋号 */
  buildingNo?: string;
  /** 单元号 */
  unitNo?: string;
  /** 房号 */
  roomNo?: string;
  /** 面积 */
  area?: number;
  /** 月租金 */
  monthlyRent?: number;
  /** 租赁开始日期 */
  leaseStartDate: string;
  /** 租赁结束日期 */
  leaseEndDate?: string;
  /** 分配状态 */
  status: AllocationStatus;
  [key: string]: unknown;
}
