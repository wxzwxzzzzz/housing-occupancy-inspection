/**
 * 公租房保障监管 (cn.byteawake.prh) — 系统配置
 *
 * B 轨临时类型：本体尚未生成 SysConfig 实体，此文件按
 * `本体改动集-交接本体团队.md` 改动 5 的 schema 手写，
 * 待后端重新生成本体模型后替换为生成版本。
 *
 * 用通用 KV + 分类承载系统配置，避免为每个配置项建字段。
 */

import type {
  IAuditInfo,
  ILogicDelete,
  ITenant,
  OntologyObject,
} from '../../ap/oms';
import type { ConfigValueType } from '../enums';

/** 系统配置 */
export interface SysConfig
  extends OntologyObject,
    IAuditInfo,
    ITenant,
    ILogicDelete {
  /** 配置键 */
  configKey: string;
  /** 配置值 */
  configValue?: string;
  /** 值类型 */
  valueType: ConfigValueType;
  /** 分类 */
  category?: string;
  /** 描述 */
  description?: string;
  /** 生效时间 */
  effectiveTime?: string;
  [key: string]: unknown;
}
