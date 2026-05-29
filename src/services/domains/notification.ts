/**
 * 通知消息服务 — Notification
 *
 * B 轨新增（见 本体改动集-交接本体团队.md 改动 6）。
 * 标准 CRUD + 自定义 markRead(标记已读) / markAllRead(全部已读)。
 * 待 System/Message 页面从旧 Message objectType 切到 Notification 后启用。
 */

import { buildEntityApi } from '../ontology/crud';
import { invokeAction } from '../ontology/client';
import { OT } from '../ontology/object-types';
import type { Notification } from '@/types/ontology/prh/entities/notification';

const base = buildEntityApi<Notification>(OT.Notification);

export const notificationService = {
  ...base,

  /** 标记单条已读 */
  markRead(id: string) {
    return invokeAction<Notification>({
      objectType: OT.Notification,
      actionName: 'markRead',
      payload: { id },
    });
  },

  /** 全部标记已读 */
  markAllRead() {
    return invokeAction<Notification>({
      objectType: OT.Notification,
      actionName: 'markAllRead',
      payload: {},
    });
  },

  /**
   * 预警类消息的轻量处置：标记已处置。
   * 预警不单独建实体，处置标记直接挂在通知消息上（见 本体改动集 改动6 备注）。
   */
  process(id: string, handleNote?: string) {
    return invokeAction<Notification>({
      objectType: OT.Notification,
      actionName: 'process',
      payload: { id, handleNote },
    });
  },
};
