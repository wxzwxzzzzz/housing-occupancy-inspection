/**
 * 启元 (cn.byteawake.gp.arche) — 企业
 * Generated from ontology/byteawake-gp-arche.cn.byteawake.gp.arche.xml
 */

import type { OntologyObject, IAuditInfo, ILogicDelete } from '../oms';
import type { EnterpriseState } from './enterprise_state';

/** 企业 */
export interface Enterprise extends OntologyObject, IAuditInfo, ILogicDelete {
  /** 企业名称 */
  name: string;
  /** 统一社会信用代码 */
  integrationCode?: string;
  /** 信用代码 */
  creditCode?: string;
  /** 法人代表 */
  legalPerson?: string;
  /** 工商注册地址 */
  registerAddress?: string;
  /** 联系人 */
  contactName?: string;
  /** 联系人手机 */
  contactPhone?: string;
  /** 联系人邮箱 */
  contactEmail?: string;
  /** 状态 */
  state: EnterpriseState;
  /** 来源系统 */
  sourceSystemId?: string;
  /** Logo */
  logo?: string;
  /** 企业规模 */
  scale?: string;
  /** 企业官网 */
  website?: string;
  /** 所属行业 */
  industryId?: string;
  [key: string]: unknown;
}
