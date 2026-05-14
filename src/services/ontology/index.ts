/**
 * 本体服务统一导出
 *
 * 业务侧只 import 这里:
 *   import { invokeAction, qb, OT, buildEntityApi } from '@/services/ontology';
 */

export { invokeAction, invokeQuery, invokeSingle } from './client';
export { qb, QueryBuilder } from './query';
export { OT, NS } from './object-types';
export type { ObjectType } from './object-types';
export { buildEntityApi } from './crud';
export type { EntityApi, ListParams } from './crud';
export {
  OntologyError,
  toAntdFieldErrors,
} from './result';
export type {
  OntologyEnvelope,
  OntologySingleEnvelope,
  OntologyResponse,
  QueryPageInfo,
} from './result';
