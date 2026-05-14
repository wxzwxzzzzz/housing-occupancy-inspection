/**
 * 本体查询元数据 (cn.byteawake.gp.oql) — 查询声明
 * Generated from ontology/byteawake-gp-oql.cn.byteawake.gp.oql.xml
 */

import type { QueryFilterGroup } from './query_filter_group';
import type { QuerySortItem } from './query_sort_item';
import type { QueryPage } from './query_page';
import type { TreeQueryOptions } from './tree_query_options';

/** 查询声明 */
export interface QuerySpec {
  /** 目标本体 */
  objectType: string;
  /** 查询字段 */
  selection?: string;
  /** 过滤条件 */
  filter?: QueryFilterGroup;
  /** 聚合指标 */
  metrics?: string;
  /** 分组维度 */
  dimensions?: string;
  /** 聚合后过滤 */
  having?: QueryFilterGroup;
  /** 排序项列表 */
  sortItems?: QuerySortItem[];
  /** 查询分页 */
  page?: QueryPage;
  /** 树查询选项 */
  treeOptions?: TreeQueryOptions;
}
