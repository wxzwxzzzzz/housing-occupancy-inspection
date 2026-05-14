/**
 * 公租房保障监管 (cn.byteawake.prh) — 家庭成员
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete } from '../../ap/oms';
import type { Household } from './household';
import type { Resident } from './resident';

/** 家庭成员 */
export interface HouseholdMember extends OntologyObject, IAuditInfo, ITenant, ILogicDelete {
  /** 所属家庭 */
  household: Household;
  /** 关联居民 */
  resident?: Resident;
  /** 成员姓名 */
  fullName: string;
  /** 身份证号 */
  idCardNo: string;
  /** 与申请人关系 */
  relationship?: string;
  /** 是否计入家庭人口 */
  isIncluded: boolean;
  /** 加入时间 */
  joinAt?: string;
  [key: string]: unknown;
}
