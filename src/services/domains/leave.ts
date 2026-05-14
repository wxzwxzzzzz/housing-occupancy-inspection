/**
 * 请假相关服务 — Leave / LeaveType / LeaveAttachment
 */

import { buildEntityApi } from '../ontology/crud';
import { OT } from '../ontology/object-types';
import type { Leave } from '@/types/ontology/prh/entities/leave';
import type { LeaveType } from '@/types/ontology/prh/entities/leave_type';
import type { LeaveAttachment } from '@/types/ontology/prh/entities/leave_attachment';
import type { LeaveFact } from '@/types/ontology/prh/facts/leave_fact';

export const leaveService = buildEntityApi<Leave>(OT.Leave);
export const leaveTypeService = buildEntityApi<LeaveType>(OT.LeaveType, {
  withoutLogicDelete: true,
});
export const leaveAttachmentService = buildEntityApi<LeaveAttachment>(OT.LeaveAttachment);
export const leaveFactService = buildEntityApi<LeaveFact>(OT.LeaveFact, {
  withoutLogicDelete: true,
});
