/**
 * 公租房保障监管 (cn.byteawake.prh) — 保存的筛选器
 *
 * B 轨临时类型：本体尚未生成 SavedFilter 实体，此文件先支撑 Filter 页面走 service。
 * 待后端补实体后替换。jsonLogic 存查询构建器导出的 jsonLogic 配置。
 */

import type {
  IAuditInfo,
  ILogicDelete,
  ITenant,
  OntologyObject,
} from '../../ap/oms';

/** 保存的筛选器 */
export interface SavedFilter
  extends OntologyObject,
    IAuditInfo,
    ITenant,
    ILogicDelete {
  /** 筛选器名称 */
  name: string;
  /** 描述 */
  description?: string;
  /** 条件数 */
  fieldCount?: number;
  /** 查询构建器 jsonLogic 配置(序列化存储) */
  jsonLogic?: unknown;
  /** 状态 */
  status: 'active' | 'inactive';
  /** 创建时间(展示用) */
  createdAt?: string;
  /** 更新时间(展示用) */
  updatedAt?: string;
  [key: string]: unknown;
}
