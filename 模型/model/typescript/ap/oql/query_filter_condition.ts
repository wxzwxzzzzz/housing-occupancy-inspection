/**
 * 本体查询元数据 (cn.byteawake.gp.oql) — 查询条件项
 * Generated from ontology/byteawake-gp-oql.cn.byteawake.gp.oql.xml
 */

import type { QueryComparisonOperator } from './query_comparison_operator';

/** 查询条件项 */
export interface QueryFilterCondition {
  /** 查询路径 */
  field: string;
  /** 比较操作符 */
  operator: QueryComparisonOperator;
  /** 条件值1 */
  value1?: string;
  /** 条件值2 */
  value2?: string;
  /** 条件值列表 */
  values?: unknown[];
}
