/**
 * 启元 (cn.byteawake.gp.arche) — 租户
 * Generated from ontology/byteawake-gp-arche.cn.byteawake.gp.arche.xml
 */

import type { OntologyObject, IAuditInfo, ILogicDelete, IEnable } from '../oms';
import type { TenantStatus } from './tenant_status';

/** 租户 */
export interface Tenant extends OntologyObject, IAuditInfo, ILogicDelete, IEnable {
  /** 租户编码 */
  code?: string;
  /** 租户名称 */
  name: string;
  /** 租户全称 */
  fullName?: string;
  /** 租户状态 */
  status: TenantStatus;
  /** 注册地区 */
  area?: string;
  /** 联系人 */
  contactName?: string;
  /** 联系人手机 */
  contactPhone?: string;
  /** 联系人邮箱 */
  contactEmail?: string;
  /** 徽标 */
  logo?: string;
  /** 默认语言 */
  lang?: string;
  /** 时区 */
  timezone?: string;
  /** 允许退出 */
  allowExit?: boolean;
  /** 允许邀请 */
  invitePermission?: boolean;
  /** 允许加入 */
  joinPermission?: boolean;
  [key: string]: unknown;
}
