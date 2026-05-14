/**
 * 本体查询元数据 (cn.byteawake.gp.oql) — 查询排序方向枚举
 * Generated from ontology/byteawake-gp-oql.cn.byteawake.gp.oql.xml
 */

/** 查询排序方向 */
export const QuerySortDirection = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;
export type QuerySortDirection = (typeof QuerySortDirection)[keyof typeof QuerySortDirection];
