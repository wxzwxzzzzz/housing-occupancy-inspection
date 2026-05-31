// @ts-nocheck
/**
 * 本体 Mock 总入口
 *
 * 路由:`POST /api/v1/ontology/:actionName`
 *  - 优先匹配 customHandlers[objectType][actionName]
 *  - 其次审批类(approve/reject/withdraw/submit)对所有审批实体生效
 *  - 最后走默认 CRUD(list/detail/add/modify/delete/enable/stop/refer/querytree/archive/unsubmit)
 */

import type { Request, Response } from 'express';
import { applyQuery, ensureSeeded } from '../src/services/_mock-lib/seed';
import {
  approvalEntities,
  customHandlers,
  failureResponse,
  findAll,
  findById,
  getApprovalHandler,
  insert,
  successResponse,
  table,
  update,
} from '../src/services/_mock-lib/handlers';

// 由 mock 入口模块加载时立刻种子,避免首次请求等待
ensureSeeded();

function defaultCrudHandler(
  actionName: string,
  objectType: string,
  payload: Record<string, any>,
  id?: string,
) {
  switch (actionName) {
    case 'list':
    case 'refer':
    case 'querytree': {
      const result = applyQuery(objectType, payload as any);
      return successResponse({ data: result.data, page: result.page });
    }
    case 'detail': {
      // detail 支持两种模式:1) body.id 直接取;2) payload 是 QuerySpec
      const directId = id ?? (payload?.id as string | undefined);
      if (directId) {
        const row = findById(objectType, directId);
        return row
          ? successResponse({ data: [row] })
          : failureResponse('NOT_FOUND', '记录不存在');
      }
      const result = applyQuery(objectType, payload as any);
      return successResponse({ data: result.data.slice(0, 1), page: result.page });
    }
    case 'add': {
      const row = insert(objectType, payload);
      return successResponse({ data: [row] });
    }
    case 'modify': {
      const targetId = (payload?.id as string) ?? id;
      if (!targetId) return failureResponse('MISSING_ID', '缺少 id');
      const next = update(objectType, targetId, payload);
      return next
        ? successResponse({ data: [next] })
        : failureResponse('NOT_FOUND', '记录不存在');
    }
    case 'delete': {
      const targetId = id ?? (payload?.id as string | undefined);
      if (!targetId) return failureResponse('MISSING_ID', '缺少 id');
      const exist = findById(objectType, targetId);
      if (!exist) return failureResponse('NOT_FOUND', '记录不存在');
      // 有 dr 字段则逻辑删除,否则物理
      if ('dr' in exist) {
        update(objectType, targetId, { dr: true });
      } else {
        table(objectType).delete(targetId);
      }
      return successResponse({ data: [{ id: targetId }] });
    }
    case 'enable': {
      const targetId = id ?? (payload?.id as string);
      const next = update(objectType, targetId, { enable: true });
      return next
        ? successResponse({ data: [next] })
        : failureResponse('NOT_FOUND', '记录不存在');
    }
    case 'stop': {
      const targetId = id ?? (payload?.id as string);
      const next = update(objectType, targetId, { enable: false });
      return next
        ? successResponse({ data: [next] })
        : failureResponse('NOT_FOUND', '记录不存在');
    }
    case 'archive': {
      const targetId = id ?? (payload?.id as string);
      const next = update(objectType, targetId, {
        archiveReason: payload?.archiveReason,
        archiveNote: payload?.archiveNote,
        archiveDate: new Date().toISOString().slice(0, 10),
        status: 'ARCHIVED',
      });
      return next
        ? successResponse({ data: [next] })
        : failureResponse('NOT_FOUND', '记录不存在');
    }
    case 'unsubmit': {
      const targetId = id ?? (payload?.id as string);
      const next = update(objectType, targetId, {
        status: 'DRAFT',
        verifyState: 0,
      });
      return next
        ? successResponse({ data: [next] })
        : failureResponse('NOT_FOUND', '记录不存在');
    }
    default:
      return failureResponse('UNKNOWN_ACTION', `未实现的动作: ${actionName}`);
  }
}

function dispatch(actionName: string, body: any) {
  const objectType = String(body?.objectType ?? '');
  const payload = (body?.payload ?? {}) as Record<string, any>;
  const id = body?.id as string | undefined;
  if (!objectType) {
    return failureResponse('MISSING_OBJECT_TYPE', '缺少 objectType');
  }

  // 1) 自定义 handler
  const custom = customHandlers[objectType]?.[actionName];
  if (custom) {
    return custom({ objectType, payload, id });
  }

  // 2) 审批类
  if (approvalEntities.has(objectType as any)) {
    const approvalHandler = getApprovalHandler(actionName);
    if (approvalHandler) {
      return approvalHandler({ objectType, payload, id });
    }
  }

  // 3) 默认 CRUD
  return defaultCrudHandler(actionName, objectType, payload, id);
}

// 已登录拦截:除了 authenticate / signup,其他都需要 Bearer token
function requireAuth(actionName: string, req: Request) {
  if (actionName === 'authenticate' || actionName === 'signup') return null;
  const auth = req.headers['authorization'] ?? '';
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) return null;
  return { code: 401, body: failureResponse('UNAUTHORIZED', '未登录或登录已失效') };
}

export default {
  'POST /api/v1/ontology/:actionName': (req: Request, res: Response) => {
    const { actionName } = req.params;
    const guard = requireAuth(actionName, req);
    if (guard) {
      res.status(guard.code).json(guard.body);
      return;
    }
    try {
      const result = dispatch(actionName, req.body ?? {});
      res.json(result);
    } catch (err: any) {
      res.status(500).json(
        failureResponse('INTERNAL', err?.message ?? '内部错误'),
      );
    }
  },

  // 调试:看当前 mock 数据条数
  'GET /api/v1/ontology/_dump': (_req: Request, res: Response) => {
    const dump: Record<string, number> = {};
    const ot = require('../src/services/ontology/object-types.ts');
    Object.values(ot.OT).forEach((t) => {
      dump[t as string] = findAll(t as string).length;
    });
    res.json(dump);
  },
};
