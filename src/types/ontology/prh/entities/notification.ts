/**
 * 公租房保障监管 (cn.byteawake.prh) — 通知消息
 *
 * B 轨临时类型：本体尚未生成 Notification 实体，此文件按
 * `本体改动集-交接本体团队.md` 改动 6 的 schema 手写，
 * 待后端重新生成本体模型后替换为生成版本。
 */

import type { User } from '../../ap/arche';
import type {
  IAuditInfo,
  ILogicDelete,
  ITenant,
  OntologyObject,
} from '../../ap/oms';
import type {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from '../enums';
import type { Resident } from './resident';

/** 通知消息 */
export interface Notification
  extends OntologyObject,
    IAuditInfo,
    ITenant,
    ILogicDelete {
  /** 接收居民 */
  recipient?: Resident;
  /** 接收用户 */
  recipientUser?: User;
  /** 通知类型 */
  notificationType: NotificationType;
  /** 渠道 */
  channel: NotificationChannel;
  /** 标题 */
  title: string;
  /** 内容 */
  content?: string;
  /** 状态 */
  status: NotificationStatus;
  /** 已读时间 */
  readAt?: string;
  /** 发送时间 */
  sentAt?: string;
  /** 业务对象类型 */
  bizType?: string;
  /** 业务对象标识 */
  bizRef?: string;
  /**
   * 是否已处置（仅预警类消息有意义）。
   * 预警不单独建实体，处置标记轻量挂在通知消息上（见 本体改动集 改动6 备注）。
   */
  handled?: boolean;
  /** 处置时间 */
  handledAt?: string;
  /** 处置人 */
  handledBy?: User;
  /** 处置备注 */
  handleNote?: string;
  [key: string]: unknown;
}
