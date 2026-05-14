/**
 * 公共元数据 (cn.byteawake.gp.oms) — 树型结构混入接口
 * Generated from ontology/byteawake-gp-oms.cn.byteawake.gp.oms.xml
 */

/** 树型结构 */
export interface ITree {
  /** 名称 */
  name?: string;
  /** 上级 */
  parent?: string;
  /** 层级 */
  level?: number;
  /** 路径 */
  path?: string;
  /** 序号 */
  ordinal?: number;
  /** 是否末级 */
  isEnd?: boolean;
}
