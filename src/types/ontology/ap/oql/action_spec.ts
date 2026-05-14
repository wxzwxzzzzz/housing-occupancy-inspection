/**
 * 本体查询元数据 (cn.byteawake.gp.oql) — 动作声明
 * Generated from ontology/byteawake-gp-oql.cn.byteawake.gp.oql.xml
 */

/** 动作声明 */
export interface ActionSpec {
  /** 目标本体 */
  objectType: string;
  /** 动作名称 */
  actionName: string;
  /** 动作载荷 */
  payload?: Record<string, unknown>;
}
