/**
 * 公租房保障监管 (cn.byteawake.prh) — 租赁补贴事实
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { RentalSubsidy } from '../entities/rental_subsidy';
import type { Household } from '../entities/household';
import type { SubsidyStatus } from '../enums';

/** 租赁补贴事实 */
export interface RentalSubsidyFact {
  /** 租赁补贴 */
  subsidy: RentalSubsidy;
  /** 所属家庭 */
  household: Household;
  /** 补贴开始日期 */
  startDate?: string;
  /** 补贴结束日期 */
  endDate?: string;
  /** 补贴状态 */
  subsidyStatus: SubsidyStatus;
  /** 补贴记录数量 */
  subsidyCount: number;
  /** 生效补贴数量 */
  activeSubsidyCount: number;
  /** 暂停补贴数量 */
  suspendedSubsidyCount: number;
  /** 终止补贴数量 */
  terminatedSubsidyCount: number;
  /** 到期补贴数量 */
  expiredSubsidyCount: number;
  /** 理论月补贴金额 */
  monthlyEntitlementAmount?: number;
  /** 生效理论月补贴金额 */
  activeMonthlyEntitlementAmount?: number;
  /** 生效平均理论月补贴 */
  avgActiveMonthlyEntitlement?: number;
}
