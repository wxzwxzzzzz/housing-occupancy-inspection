/**
 * 公共元数据 (cn.byteawake.ap.oms) — 用户（业务投影）
 * Generated from ontology/byteawake-ap-oms.cn.byteawake.ap.oms.xml
 */

import type { OntologyObject } from './ontology_object';

/** 用户（业务投影） */
export interface User extends OntologyObject {
  /** 真实姓名 */
  realName?: string;
  /** 昵称 */
  nickname?: string;
  /** 手机号 */
  phone?: string;
  /** 邮箱 */
  email?: string;
  /** 头像 */
  avatar?: string;
}
