/**
 * 本体查询元数据 (cn.byteawake.gp.oql) — 树查询范围枚举
 * Generated from ontology/byteawake-gp-oql.cn.byteawake.gp.oql.xml
 */

/** 树查询范围 */
export const TreeQueryScope = {
  ROOT_CHILDREN: 'ROOT_CHILDREN',
  SUBTREE: 'SUBTREE',
  ANCESTORS: 'ANCESTORS',
} as const;
export type TreeQueryScope = (typeof TreeQueryScope)[keyof typeof TreeQueryScope];
