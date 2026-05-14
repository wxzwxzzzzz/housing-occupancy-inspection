/**
 * 公租房保障监管 (cn.byteawake.prh) — 租赁补贴
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete } from '../../ap/oms';
import type { Household } from './household';
import type { SubsidyStatus } from '../enums';

/** 租赁补贴 */
export interface RentalSubsidy extends OntologyObject, IAuditInfo, ITenant, ILogicDelete {
  /** 所属家庭 */
  household: Household;
  /** 月补贴金额 */
  monthlyAmount: number;
  /** 补贴开始日期 */
  startDate: string;
  /** 补贴结束日期 */
  endDate?: string;
  /** 收款账户 */
  bankAccount?: string;
  /** 开户行 */
  bankName?: string;
  /** 补贴状态 */
  status: SubsidyStatus;
  [key: string]: unknown;
}
