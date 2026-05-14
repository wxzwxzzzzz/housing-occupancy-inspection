/**
 * 公租房保障监管 (cn.byteawake.prh) — 外出务工申请
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete } from '../../ap/oms';
import type { ISubmitInfo, IApprovalInfo, IApprovalFlow } from '../../ap/approval';
import type { Resident } from './resident';
import type { PrhAddress } from '../structs';
import type { ApplicationStatus } from '../enums';

/** 外出务工申请 */
export interface MigrantWork extends OntologyObject, IAuditInfo, ITenant, ILogicDelete, ISubmitInfo, IApprovalInfo, IApprovalFlow {
  /** 申请居民 */
  resident: Resident;
  /** 务工居住地址 */
  residentAddress: PrhAddress;
  /** 务工单位 */
  company?: string;
  /** 工作地址 */
  companyAddress?: PrhAddress;
  /** 单位联系人 */
  companyContract?: string;
  /** 单位联系电话 */
  companyContractPhone?: string;
  /** 开始日期 */
  startDate: string;
  /** 结束日期 */
  endDate?: string;
  /** 外出原因 */
  reason?: string;
  /** 申请状态 */
  status: ApplicationStatus;
  [key: string]: unknown;
}
