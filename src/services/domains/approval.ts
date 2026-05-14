/**
 * 审批通用动作 — 适用所有混入 IApprovalFlow 的实体
 *
 * 用法:
 *   approvalService.approve(OT.Leave, leaveId, '同意');
 */

import { invokeAction } from '../ontology/client';

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
