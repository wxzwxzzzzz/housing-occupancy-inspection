/**
 * 公共元数据 (cn.byteawake.ap.oms) — 审计信息混入接口
 * Generated from ontology/byteawake-ap-oms.cn.byteawake.ap.oms.xml
 */

import type { User } from './user';

/** 审计信息 */
export interface IAuditInfo {
  /** 创建人 */
  creator?: User;
  /** 创建时间 */
  createAt?: string;
  /** 修改人 */
  modifier?: User;
  /** 修改时间 */
  modifyAt?: string;
}
