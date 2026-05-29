/**
 * 公租房保障监管 (cn.byteawake.prh) — 审批记录(多级流程节点)
 *
 * B 轨临时类型：本体 ap-approval 只有单次审批字段(IApprovalInfo)，没有多级审批
 * 记录列表。此实体先支撑详情页右侧的多级审批流程时间线。待后端工作流引擎
 * (processInstance)接入后，由后端返回流程节点列表替换。
 */

import type { IAuditInfo, ITenant, OntologyObject } from '../../ap/oms';

/** 审批记录结果 */
export type ApprovalRecordResult =
  | 'PASS'
  | 'REJECT'
  | 'PENDING'
  | 'NOT_CREATED';

/** 审批记录(一个单据多条,组成多级流程时间线) */
export interface ApprovalRecord extends OntologyObject, IAuditInfo, ITenant {
  /** 关联单据类型(objectType,如 cn.byteawake.prh.Leave) */
  bizType: string;
  /** 关联单据 id */
  bizRef: string;
  /** 步骤顺序 */
  ordinal: number;
  /** 环节名(发起人/逐级领导审批/法务初审...) */
  stepName: string;
  /** 审批人姓名 */
  approverName?: string;
  /** 该步审批时间 */
  approvalTime?: string;
  /** 审批意见 */
  opinion?: string;
  /** 结果:通过/驳回/待审批/流程未创建 */
  result: ApprovalRecordResult;
  [key: string]: unknown;
}
