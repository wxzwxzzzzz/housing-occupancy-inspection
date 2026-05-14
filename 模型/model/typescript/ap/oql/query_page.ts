/**
 * 本体查询元数据 (cn.byteawake.gp.oql) — 查询分页
 * Generated from ontology/byteawake-gp-oql.cn.byteawake.gp.oql.xml
 */

/** 查询分页 */
export interface QueryPage {
  /** 页码 */
  pageNo?: number;
  /** 页大小 */
  pageSize?: number;
  /** 向前条数 */
  first?: number;
  /** 起始游标 */
  after?: string;
  /** 向后条数 */
  last?: number;
  /** 结束游标 */
  before?: string;
}
