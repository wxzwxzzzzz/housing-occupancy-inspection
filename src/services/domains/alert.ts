// @ts-nocheck
/**
 * 预警服务 — 由 AttendanceFact 派生
 *
 * 决策(2026-05-29)：预警不做独立 Alert 实体。预警是从 AttendanceFact
 * 按规则计算出来的只读视图(参考手册 4.3:位置偏离/人脸不匹配/未打卡)，
 * 统计复用 AttendanceFact，处置标记轻量挂在 Notification 上。
 *
 * 这里把"预警"建模为 fact 的过滤视图:
 *   - INVALID  → ALERT_WARNING
 *   - MISSED   → ALERT_RED
 *   - 其他     → 不展示
 */

import { qb } from '../ontology/query';
import { invokeQuery } from '../ontology/client';
import { OT } from '../ontology/object-types';
import type { AttendanceFact } from '@/types/ontology/prh/facts/attendance_fact';
import type { AlertLevel, AttendanceStatus } from '@/types/ontology/prh/enums';

export interface AlertItem {
  id: string;
  resident: string;
  level: AlertLevel;
  title: string;
  content: string;
  createTime: string;
  factId: string;
  attendanceStatus: AttendanceStatus;
  status: 'pending' | 'processing' | 'resolved';
}

const ALERT_STATUSES: AttendanceStatus[] = ['INVALID', 'MISSED'];

function levelOf(status: AttendanceStatus): AlertLevel {
  if (status === 'MISSED') return 'ALERT_RED';
  if (status === 'INVALID') return 'ALERT_WARNING';
  return 'ALERT_INFO';
}

function titleOf(status: AttendanceStatus): string {
  switch (status) {
    case 'INVALID':
      return '打卡异常(位置/人脸不匹配)';
    case 'MISSED':
      return '未在规定时间打卡';
    case 'PENDING':
      return '待打卡';
    default:
      return '考勤事件';
  }
}

export const alertService = {
  async list(params?: { pageNo?: number; pageSize?: number; level?: AlertLevel }) {
    const builder = qb(OT.AttendanceFact)
      .select(
        'id,attendance,resident,attendanceType,attendanceMode,attendanceStatus,checkIn,deadline,attendanceTimeliness',
      )
      .in('attendanceStatus', ALERT_STATUSES as unknown as string[])
      .orderBy('checkIn', 'DESC')
      .page(params?.pageNo ?? 1, params?.pageSize ?? 20);

    const env = await invokeQuery<AttendanceFact>(OT.AttendanceFact, builder.build());
    let items = env.data.map<AlertItem>((fact) => {
      const id = String(fact.attendance ?? (fact as any).id ?? '');
      return {
        id,
        factId: String((fact as any).id ?? ''),
        resident: String(fact.resident ?? ''),
        level: levelOf(fact.attendanceStatus),
        title: titleOf(fact.attendanceStatus),
        content: `${titleOf(fact.attendanceStatus)} · 居民 ${fact.resident}`,
        createTime: String(fact.checkIn ?? fact.deadline ?? ''),
        attendanceStatus: fact.attendanceStatus,
        status: 'pending',
      };
    });

    if (params?.level) {
      items = items.filter((i) => i.level === params.level);
    }

    return { data: items, page: env.page };
  },
};
