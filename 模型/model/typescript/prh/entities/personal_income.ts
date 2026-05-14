/**
 * 公租房保障监管 (cn.byteawake.prh) — 个人收入
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete } from '../../ap/oms';
import type { Resident } from './resident';
import type { IncomeType, RecordStatus } from '../enums';

/** 个人收入 */
export interface PersonalIncome extends OntologyObject, IAuditInfo, ITenant, ILogicDelete {
  /** 所属居民 */
  resident: Resident;
  /** 收入类型 */
  incomeType: IncomeType;
  /** 金额 */
  amount: number;
  /** 所属期间 */
  period?: string;
  /** 收入来源单位 */
  employer?: string;
  /** 收入证明附件 */
  certPhoto?: string;
  /** 记录状态 */
  status: RecordStatus;
  [key: string]: unknown;
}
