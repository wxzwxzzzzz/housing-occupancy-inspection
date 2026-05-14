/**
 * 本体查询元数据 (cn.byteawake.gp.oql) — 查询排序项
 * Generated from ontology/byteawake-gp-oql.cn.byteawake.gp.oql.xml
 */

import type { QuerySortDirection } from './query_sort_direction';

/** 查询排序项 */
export interface QuerySortItem {
  /** 查询路径 */
  path: string;
  /** 排序方向 */
  direction: QuerySortDirection;
}
