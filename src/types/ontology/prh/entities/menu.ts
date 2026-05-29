/**
 * 公租房保障监管 (cn.byteawake.prh) — 菜单
 *
 * B 轨临时类型：本体尚未生成 Menu 实体（菜单/导航属平台层，待对接），
 * 此文件先支撑 System/Menu 页面走 service。待后端补实体后替换。
 */

import type {
  IAuditInfo,
  ILogicDelete,
  ITenant,
  OntologyObject,
} from '../../ap/oms';

/** 菜单 */
export interface Menu
  extends OntologyObject,
    IAuditInfo,
    ITenant,
    ILogicDelete {
  /** 菜单名称 */
  name: string;
  /** 路由路径 */
  path: string;
  /** 图标 */
  icon?: string;
  /** 上级菜单 id */
  parentId?: string;
  /** 排序 */
  sort: number;
  /** 类型 */
  type: 'menu' | 'button';
  /** 权限标识 */
  permission?: string;
  /** 是否可见 */
  visible: boolean;
  /** 状态 */
  status: 'active' | 'inactive';
  [key: string]: unknown;
}
