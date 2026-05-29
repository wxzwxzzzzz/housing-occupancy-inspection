/**
 * 公租房保障监管 (cn.byteawake.prh) — 角色
 *
 * B 轨临时类型：本体尚未生成 Role 实体（角色/权限属平台 arche 层，待对接），
 * 此文件先支撑 System/Role 页面走 service。待后端补实体后替换。
 */

import type {
  IAuditInfo,
  ILogicDelete,
  ITenant,
  OntologyObject,
} from '../../ap/oms';

/** 角色 */
export interface Role
  extends OntologyObject,
    IAuditInfo,
    ITenant,
    ILogicDelete {
  /** 角色名称 */
  name: string;
  /** 角色编码 */
  code: string;
  /** 描述 */
  description?: string;
  /** 关联用户数 */
  userCount?: number;
  /** 权限 key 列表 */
  permissions?: string[];
  /** 状态 */
  status: 'active' | 'inactive';
  /** 创建时间(展示用) */
  createTime?: string;
  [key: string]: unknown;
}
