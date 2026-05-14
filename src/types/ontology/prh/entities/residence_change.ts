/**
 * 公租房保障监管 (cn.byteawake.prh) — 居住地址变更申请
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete } from '../../ap/oms';
import type { ISubmitInfo, IApprovalInfo, IApprovalFlow } from '../../ap/approval';
import type { Resident } from './resident';
import type { PrhAddress } from '../structs';
import type { ApplicationStatus } from '../enums';

/** 居住地址变更申请 */
export interface ResidenceChange extends OntologyObject, IAuditInfo, ITenant, ILogicDelete, ISubmitInfo, IApprovalInfo, IApprovalFlow {
  /** 申请居民 */
  resident: Resident;
  /** 新居住地址 */
  address: PrhAddress;
  /** 变更原因 */
  reason?: string;
  /** 申请状态 */
  status: ApplicationStatus;
  [key: string]: unknown;
}
