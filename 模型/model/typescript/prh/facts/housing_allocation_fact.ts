/**
 * 公租房保障监管 (cn.byteawake.prh) — 实物配租事实
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { HousingAllocation } from '../entities/housing_allocation';
import type { Household } from '../entities/household';
import type { AllocationStatus } from '../enums';

/** 实物配租事实 */
export interface HousingAllocationFact {
  /** 实物配租 */
  allocation: HousingAllocation;
  /** 所属家庭 */
  household: Household;
  /** 项目名称 */
  projectName: string;
  /** 楼栋号 */
  buildingNo?: string;
  /** 租赁开始日期 */
  leaseStartDate?: string;
  /** 租赁结束日期 */
  leaseEndDate?: string;
  /** 分配状态 */
  allocationStatus: AllocationStatus;
  /** 配租记录数量 */
  allocationCount: number;
  /** 生效配租数量 */
  activeAllocationCount: number;
  /** 终止配租数量 */
  terminatedAllocationCount: number;
  /** 到期配租数量 */
  expiredAllocationCount: number;
  /** 分配面积 */
  allocatedArea?: number;
  /** 生效分配面积 */
  activeAllocatedArea?: number;
  /** 月租金金额 */
  monthlyRentAmount?: number;
  /** 生效月租金金额 */
  activeMonthlyRentAmount?: number;
  /** 生效平均面积 */
  avgActiveArea?: number;
  /** 生效平均月租金 */
  avgActiveMonthlyRent?: number;
}
