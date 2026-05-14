/**
 * 本体统一调用客户端
 *
 * 全部业务通过 invokeAction 走 `POST /api/v1/ontology/{actionName}`,
 * 由 OMS 运行时根据 ActionSpec 分发到对应实体的处理器。
 */

import { request } from '@umijs/max';
import type { ActionSpec } from '@/types/ontology/ap/oql/action_spec';
import type { QuerySpec } from '@/types/ontology/ap/oql/query_spec';
import {
  OntologyError,
  type OntologyEnvelope,
  type OntologyResponse,
  type OntologySingleEnvelope,
} from './result';

const BASE = '/api/v1/ontology';

interface InvokeOptions {
  /** 跳过响应拦截器的全局错误提示,业务自行处理 */
  silent?: boolean;
}

/**
 * 调用本体动作(写操作或自定义动作)。
 * payload 形态依 actionName 而定:
 *  - 写动作 → 业务字段 / { id, ...更新字段 }
 *  - 查询动作 → QuerySpec
 *  - 无参数动作 → 在外层 { objectType, id } 传 id
 */
export async function invokeAction<T = unknown>(
  spec: ActionSpec,
  options: InvokeOptions = {},
): Promise<OntologyEnvelope<T>> {
  const url = `${BASE}/${encodeURIComponent(spec.actionName)}`;
  const body: Record<string, unknown> = {
    objectType: spec.objectType,
    payload: spec.payload ?? {},
  };

  // 无参数动作的便捷传 id 形态
  const payload = spec.payload as Record<string, unknown> | undefined;
  if (payload && Object.keys(payload).length === 1 && 'id' in payload) {
    body.id = payload.id;
  }

  const raw = await request<OntologyResponse<T>>(url, {
    method: 'POST',
    data: body,
    skipErrorHandler: options.silent === true,
  });

  if (!raw || raw.success === false) {
    throw new OntologyError(raw ?? { success: false, code: 'EMPTY_RESPONSE' });
  }

  return {
    data: raw.data ?? [],
    page: raw.page,
    raw,
  };
}

/** 单对象返回(detail / add / modify) */
export async function invokeSingle<T = unknown>(
  spec: ActionSpec,
  options: InvokeOptions = {},
): Promise<OntologySingleEnvelope<T>> {
  const env = await invokeAction<T>(spec, options);
  return {
    data: env.data[0] ?? null,
    raw: env.raw,
  };
}

/** 列表查询(payload 是 QuerySpec) */
export async function invokeQuery<T = unknown>(
  objectType: string,
  query: Omit<QuerySpec, 'objectType'>,
  actionName: 'list' | 'detail' | 'querytree' | 'refer' = 'list',
  options: InvokeOptions = {},
): Promise<OntologyEnvelope<T>> {
  return invokeAction<T>(
    {
      objectType,
      actionName,
      payload: { objectType, ...query } as Record<string, unknown>,
    },
    options,
  );
}
