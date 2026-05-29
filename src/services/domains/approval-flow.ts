/**
 * 审批流程定义服务 — ApprovalFlow
 *
 * B 轨新增：审批流程定义本体暂无实体，先走临时类型 + mock。标准 CRUD 满足 Workflow 页面。
 * graph(LogicFlow 图)随流程一起存;待后端补实体后换 URL 即用。
 */

import { buildEntityApi } from '../ontology/crud';
import { OT } from '../ontology/object-types';
import type { ApprovalFlow } from '@/types/ontology/prh/entities/approval_flow';

export const approvalFlowService = buildEntityApi<ApprovalFlow>(OT.ApprovalFlow);
