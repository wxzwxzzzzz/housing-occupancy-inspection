/**
 * 公租房保障监管 (cn.byteawake.prh) — 请假附件
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete, Attachment } from '../../ap/oms';
import type { Leave } from './leave';

/** 请假附件 */
export interface LeaveAttachment extends OntologyObject, IAuditInfo, ITenant, ILogicDelete {
  /** 所属请假 */
  leave: Leave;
  /** 附件文件 */
  file?: Attachment;
  [key: string]: unknown;
}
