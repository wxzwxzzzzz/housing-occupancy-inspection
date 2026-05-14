/**
 * 公租房保障监管 (cn.byteawake.prh) — 个人收入事实
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { PersonalIncome } from '../entities/personal_income';
import type { Resident } from '../entities/resident';
import type { IncomeType, RecordStatus } from '../enums';

/** 个人收入事实 */
export interface PersonalIncomeFact {
  /** 个人收入 */
  income: PersonalIncome;
  /** 保障居民 */
  resident: Resident;
  /** 收入类型 */
  incomeType: IncomeType;
  /** 所属期间 */
  period?: string;
  /** 记录状态 */
  recordStatus: RecordStatus;
  /** 收入记录数量 */
  incomeRecordCount: number;
  /** 生效收入记录数量 */
  activeIncomeRecordCount: number;
  /** 收入金额 */
  incomeAmount: number;
  /** 平均收入金额 */
  avgIncomeAmount?: number;
}
