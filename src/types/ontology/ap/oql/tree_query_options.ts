/**
 * 本体查询元数据 (cn.byteawake.gp.oql) — 树查询选项
 * Generated from ontology/byteawake-gp-oql.cn.byteawake.gp.oql.xml
 */

import type { TreeQueryScope } from './tree_query_scope';

/** 树查询选项 */
export interface TreeQueryOptions {
  /** 根节点标识 */
  rootId?: string;
  /** 父节点标识 */
  parentId?: string;
  /** 最大层级 */
  maxDepth?: number;
  /** 是否包含根节点 */
  includeRoot?: boolean;
  /** 是否递归 */
  recursive?: boolean;
  /** 查询范围 */
  scope?: TreeQueryScope;
}
