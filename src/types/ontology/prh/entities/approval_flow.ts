/**
 * 公租房保障监管 (cn.byteawake.prh) — 审批流程定义
 *
 * B 轨临时类型：本体尚未生成 ApprovalFlow 实体，此文件先支撑 Approval/Workflow 页面走 service。
 * 待后端补实体后替换。graph 存 LogicFlow 的 { nodes, edges } 图数据。
 */

import type {
  IAuditInfo,
  ILogicDelete,
  ITenant,
  OntologyObject,
} from '../../ap/oms';

/** 审批流程定义 */
export interface ApprovalFlow
  extends OntologyObject,
    IAuditInfo,
    ITenant,
    ILogicDelete {
  /** 流程业务键(material/leave/filing 等) */
  flowKey: string;
  /** 流程名称 */
  name: string;
  /** 版本 */
  version: string;
  /** 状态(已启用/已停用) */
  status: string;
  /** 创建人(展示名,区别于 IAuditInfo.creator) */
  creatorName?: string;
  /** 创建时间(展示用) */
  createTime?: string;
  /** 流程说明 */
  description?: string;
  /** 流程图数据(X6 toJSON 的 { cells } 结构;旧数据可能为 LogicFlow 的 { nodes, edges }) */
  graph?: Record<string, any>;
  [key: string]: unknown;
}
