/**
 * 审批通用动作 — 适用所有混入 IApprovalFlow 的实体
 *
 * 用法:
 *   approvalService.approve(OT.Leave, leaveId, '同意');
 */

import { invokeAction, invokeQuery } from '../ontology/client';
import { OT } from '../ontology/object-types';
import { qb } from '../ontology/query';
import type { ApprovalRecord } from '@/types/ontology/prh/entities/approval_record';

export const approvalService = {
  approve(objectType: string, id: string, opinion?: string) {
    return invokeAction({
      objectType,
      actionName: 'approve',
      payload: { id, opinion },
    });
  },

  reject(objectType: string, id: string, opinion?: string) {
    return invokeAction({
      objectType,
      actionName: 'reject',
      payload: { id, opinion },
    });
  },

  withdraw(objectType: string, id: string) {
    return invokeAction({
      objectType,
      actionName: 'withdraw',
      payload: { id },
    });
  },

  submit(objectType: string, id: string) {
    return invokeAction({
      objectType,
      actionName: 'submit',
      payload: { id },
    });
  },
};

/**
 * 审批记录服务 — 多级审批流程时间线(B 轨临时,见 approval_record.ts)
 */
export const approvalRecordService = {
  /** 取某单据的审批记录(按 ordinal 升序) */
  async listByBiz(bizType: string, bizRef: string): Promise<ApprovalRecord[]> {
    const spec = qb(OT.ApprovalRecord)
      .eq('bizRef', bizRef)
      .orderBy('ordinal', 'ASC')
      .page(1, 100)
      .build();
    const env = await invokeQuery<ApprovalRecord>(OT.ApprovalRecord, spec);
    return (env.data as ApprovalRecord[]).filter((r) => r.bizType === bizType);
  },
};

