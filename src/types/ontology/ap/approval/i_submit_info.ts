/**
 * 审批公共接口 (cn.byteawake.gp.approval) — 提交信息
 * Generated from ontology/byteawake-gp-approval.cn.byteawake.gp.approval.xml
 */

import type { User } from '../arche';

/** 提交信息 */
export interface ISubmitInfo {
  /** 提交时间 */
  submittedAt?: string;
  /** 提交人 */
  submittedBy?: User;
  /** 撤回时间 */
  withdrawnAt?: string;
  /** 撤回人 */
  withdrawnBy?: User;
}
