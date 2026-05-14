/**
 * 本体查询元数据 (cn.byteawake.gp.oql) — 查询比较操作符枚举
 * Generated from ontology/byteawake-gp-oql.cn.byteawake.gp.oql.xml
 */

/** 查询比较操作符 */
export const QueryComparisonOperator = {
  EQ: 'EQ',
  NE: 'NE',
  GT: 'GT',
  GE: 'GE',
  LT: 'LT',
  LE: 'LE',
  LIKE: 'LIKE',
  IN: 'IN',
  BETWEEN: 'BETWEEN',
  IS_NULL: 'IS_NULL',
  NOT_NULL: 'NOT_NULL',
} as const;
export type QueryComparisonOperator = (typeof QueryComparisonOperator)[keyof typeof QueryComparisonOperator];
