/**
 * 本体查询元数据 (cn.byteawake.gp.oql) — 查询逻辑操作符枚举
 * Generated from ontology/byteawake-gp-oql.cn.byteawake.gp.oql.xml
 */

/** 查询逻辑操作符 */
export const QueryLogicalOperator = {
  AND: 'AND',
  OR: 'OR',
} as const;
export type QueryLogicalOperator = (typeof QueryLogicalOperator)[keyof typeof QueryLogicalOperator];
