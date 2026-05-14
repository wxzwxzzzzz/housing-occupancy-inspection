/**
 * 通用 CRUD 工厂
 *
 * buildEntityApi(objectType) 返回该实体最常用的 list/detail/add/modify/delete/enable/stop/refer。
 * 业务域服务通过 `...buildEntityApi(...)` 派生,再补自己的特殊 action。
 */

import type { QueryPage } from '@/types/ontology/ap/oql/query_page';
import type { QuerySpec } from '@/types/ontology/ap/oql/query_spec';
import { invokeAction, invokeQuery, invokeSingle } from './client';
import type { OntologyEnvelope, OntologySingleEnvelope } from './result';

export interface ListParams extends Omit<QuerySpec, 'objectType'> {
  /** 是否包含逻辑删除的记录,默认 false(只看未删除) */
  includeDeleted?: boolean;
}

export interface BuildEntityApiOptions {
  /** 该实体不带 ILogicDelete,跳过 dr 过滤 */
  withoutLogicDelete?: boolean;
}

export function buildEntityApi<T>(objectType: string, options: BuildEntityApiOptions = {}) {
  const supportLogicDelete = !options.withoutLogicDelete;

  function withDefaultFilter(params: ListParams): Omit<QuerySpec, 'objectType'> {
    if (!supportLogicDelete || params.includeDeleted) {
      const { includeDeleted: _ignored, ...rest } = params;
      return rest;
    }
    const filter = params.filter ?? { operator: 'AND', conditions: [], groups: [] };
    const conditions = filter.conditions ?? [];
    if (!conditions.some((c) => c.field === 'dr')) {
      conditions.push({ field: 'dr', operator: 'EQ', value1: 'false' });
    }
    const { includeDeleted: _ignored, ...rest } = params;
    return {
      ...rest,
      filter: { ...filter, conditions, groups: filter.groups ?? [] },
    };
  }

  return {
    objectType,

    list(params: ListParams = {}): Promise<OntologyEnvelope<T>> {
      const finalParams: Omit<QuerySpec, 'objectType'> = {
        page: { pageNo: 1, pageSize: 20 } as QueryPage,
        ...withDefaultFilter(params),
      };
      return invokeQuery<T>(objectType, finalParams, 'list');
    },

    refer(params: ListParams = {}): Promise<OntologyEnvelope<T>> {
      return invokeQuery<T>(objectType, withDefaultFilter(params), 'refer');
    },

    querytree(params: ListParams = {}): Promise<OntologyEnvelope<T>> {
      return invokeQuery<T>(objectType, withDefaultFilter(params), 'querytree');
    },

    detail(idOrParams: string | ListParams): Promise<OntologySingleEnvelope<T>> {
      const params: Omit<QuerySpec, 'objectType'> =
        typeof idOrParams === 'string'
          ? {
              filter: {
                operator: 'AND',
                conditions: [{ field: 'id', operator: 'EQ', value1: idOrParams }],
                groups: [],
              },
              page: { pageNo: 1, pageSize: 1 },
            }
          : withDefaultFilter(idOrParams);
      return invokeAction<T>(
        {
          objectType,
          actionName: 'detail',
          payload: { objectType, ...params } as Record<string, unknown>,
        },
      ).then((env) => ({ data: env.data[0] ?? null, raw: env.raw }));
    },

    add(payload: Partial<T>): Promise<OntologySingleEnvelope<T>> {
      return invokeSingle<T>({
        objectType,
        actionName: 'add',
        payload: payload as Record<string, unknown>,
      });
    },

    modify(payload: Partial<T> & { id: string }): Promise<OntologySingleEnvelope<T>> {
      return invokeSingle<T>({
        objectType,
        actionName: 'modify',
        payload: payload as Record<string, unknown>,
      });
    },

    delete(id: string): Promise<OntologyEnvelope<T>> {
      return invokeAction<T>({
        objectType,
        actionName: 'delete',
        payload: { id },
      });
    },

    enable(id: string): Promise<OntologyEnvelope<T>> {
      return invokeAction<T>({
        objectType,
        actionName: 'enable',
        payload: { id },
      });
    },

    stop(id: string): Promise<OntologyEnvelope<T>> {
      return invokeAction<T>({
        objectType,
        actionName: 'stop',
        payload: { id },
      });
    },

    submit(id: string): Promise<OntologyEnvelope<T>> {
      return invokeAction<T>({
        objectType,
        actionName: 'submit',
        payload: { id },
      });
    },

    unsubmit(id: string): Promise<OntologyEnvelope<T>> {
      return invokeAction<T>({
        objectType,
        actionName: 'unsubmit',
        payload: { id },
      });
    },

    archive(id: string, archiveReason: string, archiveNote?: string): Promise<OntologyEnvelope<T>> {
      return invokeAction<T>({
        objectType,
        actionName: 'archive',
        payload: { id, archiveReason, archiveNote },
      });
    },
  };
}

export type EntityApi<T> = ReturnType<typeof buildEntityApi<T>>;
