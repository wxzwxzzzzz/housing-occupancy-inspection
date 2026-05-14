/**
 * 本体调用结果封装
 *
 * 后端返回的 OntologyResult 加 data/page 后,前端做两件事:
 *  1. 成功时返回 `OntologyEnvelope<T>`,业务直接用 .data / .page;
 *  2. 失败时抛出 `OntologyError`,Form 可以直接消费 fieldErrors。
 */

import type { FieldError } from '@/types/ontology/ap/oms/field_error';
import type { OntologyResult } from '@/types/ontology/ap/oms/ontology_result';
import type { QueryPage } from '@/types/ontology/ap/oql/query_page';

/** 后端返回原始结构(本体网关约定) */
export interface OntologyResponse<T> extends OntologyResult {
  data?: T[];
  page?: QueryPageInfo;
  fieldErrors?: FieldError[];
}

/** 包含分页元数据的查询返回 */
export interface QueryPageInfo extends QueryPage {
  total?: number;
}

/** 业务调用方拿到的封装结果 */
export interface OntologyEnvelope<T> {
  data: T[];
  page?: QueryPageInfo;
  raw: OntologyResponse<T>;
}

/** 单对象的封装(detail/add/modify 返回单条时使用) */
export interface OntologySingleEnvelope<T> {
  data: T | null;
  raw: OntologyResponse<T>;
}

export class OntologyError extends Error {
  readonly code: string;
  readonly fieldErrors: FieldError[];
  readonly raw: OntologyResponse<unknown>;
  readonly traceId?: string;

  constructor(raw: OntologyResponse<unknown>) {
    super(raw.message ?? raw.code ?? '本体调用失败');
    this.name = 'OntologyError';
    this.code = raw.code ?? 'UNKNOWN';
    this.fieldErrors = raw.fieldErrors ?? [];
    this.raw = raw;
    this.traceId = raw.traceId;
  }

  /** 取首个字段错误的 message,用于 toast 提示 */
  get firstFieldError(): string | undefined {
    return this.fieldErrors[0]?.message;
  }
}

/**
 * antd Form 适配:把 fieldErrors 转换为 setFields 可消费的结构。
 * 路径如 `cn.byteawake.prh.Resident.idCardNo` 取末段 `idCardNo`。
 */
export function toAntdFieldErrors(errors: FieldError[]): Array<{
  name: string;
  errors: string[];
}> {
  return errors.map((err) => {
    const name = err.path.includes('.') ? err.path.split('.').pop()! : err.path;
    return { name, errors: [err.message] };
  });
}
