/**
 * 公共元数据 (cn.byteawake.gp.oms) — 导入请求
 * Generated from ontology/byteawake-gp-oms.cn.byteawake.gp.oms.xml
 */

import type { ImportMode } from './import_mode';

/** 导入请求 */
export interface ImportRequest {
  /** 文件令牌 */
  fileToken: string;
  /** 导入模式 */
  mode: ImportMode;
  /** 模板编码 */
  templateCode?: string;
}
