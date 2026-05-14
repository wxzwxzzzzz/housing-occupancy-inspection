/**
 * 启元 (cn.byteawake.ap.arche) — 系统用户
 * Generated from ontology/byteawake-ap-arche.cn.byteawake.ap.arche.xml
 */

import type { User as OmsUser, IAuditInfo } from '../oms';
import type { UserStatus } from './user_status';
import type { UserType } from './user_type';
import type { EmailChangeStatus } from './email_change_status';

/** 系统用户 */
export interface User extends OmsUser, IAuditInfo {
  /** 登录账号 */
  account: string;
  /** 状态 */
  status: UserStatus;
  /** 用户类型 */
  userType: UserType;
  /** 激活时间 */
  activateAt?: string;
  /** 停用时间 */
  disableAt?: string;
  /** 注销时间 */
  deleteAt?: string;
  /** 连续登录失败次数 */
  failedLoginAttempts?: number;
  /** 锁定截止时间 */
  lockedUntil?: string;
  /** 是否匿名用户 */
  isAnonymous: boolean;
  /** 是否SSO用户 */
  isSSOUser: boolean;
  /** 邮箱确认时间 */
  emailConfirmedAt?: string;
  /** 手机确认时间 */
  phoneConfirmedAt?: string;
  /** 最后登录时间 */
  lastSignInAt?: string;
  /** 封禁截止时间 */
  bannedUntil?: string;
  /** 确认时间 */
  confirmedAt?: string;
  /** 应用元数据 */
  rawAppMetaData?: string;
  /** 用户元数据 */
  rawUserMetaData?: string;
  /** 邮箱变更状态 */
  emailChangeStatus: EmailChangeStatus;
  /** 邮箱变更目标 */
  emailChangeTarget?: string;
  /** 邀请时间 */
  invitedAt?: string;
  [key: string]: unknown;
}
