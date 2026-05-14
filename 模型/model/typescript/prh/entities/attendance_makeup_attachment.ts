/**
 * 公租房保障监管 (cn.byteawake.prh) — 补卡附件
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete, Attachment } from '../../ap/oms';
import type { AttendanceMakeup } from './attendance_makeup';

/** 补卡附件 */
export interface AttendanceMakeupAttachment extends OntologyObject, IAuditInfo, ITenant, ILogicDelete {
  /** 所属补卡 */
  makeup: AttendanceMakeup;
  /** 附件文件 */
  file?: Attachment;
  [key: string]: unknown;
}
