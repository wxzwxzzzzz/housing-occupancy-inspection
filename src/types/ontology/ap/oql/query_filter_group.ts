/**
 * 本体查询元数据 (cn.byteawake.gp.oql) — 查询条件组
 * Generated from ontology/byteawake-gp-oql.cn.byteawake.gp.oql.xml
 */

import type { QueryLogicalOperator } from './query_logical_operator';
import type { QueryFilterCondition } from './query_filter_condition';

/** 查询条件组 */
export interface QueryFilterGroup {
  /** 逻辑操作符 */
  operator: QueryLogicalOperator;
  /** 条件项列表 */
  conditions?: QueryFilterCondition[];
  /** 子过滤条件组 */
  groups?: QueryFilterGroup[];
}
