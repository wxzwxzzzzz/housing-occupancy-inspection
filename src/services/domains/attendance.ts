/**
 * 考勤打卡相关服务
 *
 * 包含:
 *  - Attendance(打卡记录)+ 自定义 checkin
 *  - AttendanceSolution(方案)
 *  - AttendanceRule(规则)
 *  - AttendanceMakeup(补卡,审批流)
 *  - AttendanceFact(事实表,给报表用)
 */

import { buildEntityApi } from '../ontology/crud';
import { invokeAction } from '../ontology/client';
import { OT } from '../ontology/object-types';
import type { Attendance } from '@/types/ontology/prh/entities/attendance';
import type { AttendanceSolution } from '@/types/ontology/prh/entities/attendance_solution';
import type { AttendanceRule } from '@/types/ontology/prh/entities/attendance_rule';
import type { AttendanceMakeup } from '@/types/ontology/prh/entities/attendance_makeup';
import type { AttendanceMakeupAttachment } from '@/types/ontology/prh/entities/attendance_makeup_attachment';
import type { AttendanceFact } from '@/types/ontology/prh/facts/attendance_fact';
import type { AttendanceMakeupFact } from '@/types/ontology/prh/facts/attendance_makeup_fact';
import type { AttendanceType } from '@/types/ontology/prh/enums';
import type { GeoPoint } from '@/types/ontology/ap/oms/geo_point';
import type { Attachment } from '@/types/ontology/ap/oms/attachment';

const baseAttendance = buildEntityApi<Attendance>(OT.Attendance, { withoutLogicDelete: true });

export const attendanceService = {
  ...baseAttendance,

  /** 居民端发起打卡 */
  checkin(params: {
    resident: string;
    attendanceType?: AttendanceType;
    location?: GeoPoint;
    face?: Attachment;
  }) {
    return invokeAction<Attendance>({
      objectType: OT.Attendance,
      actionName: 'checkin',
      payload: params as Record<string, unknown>,
    });
  },
};

export const attendanceSolutionService = buildEntityApi<AttendanceSolution>(
  OT.AttendanceSolution,
);

export const attendanceRuleService = buildEntityApi<AttendanceRule>(OT.AttendanceRule);

export const attendanceMakeupService = buildEntityApi<AttendanceMakeup>(OT.AttendanceMakeup);
export const attendanceMakeupAttachmentService = buildEntityApi<AttendanceMakeupAttachment>(
  OT.AttendanceMakeupAttachment,
);

export const attendanceFactService = buildEntityApi<AttendanceFact>(OT.AttendanceFact, {
  withoutLogicDelete: true,
});
export const attendanceMakeupFactService = buildEntityApi<AttendanceMakeupFact>(
  OT.AttendanceMakeupFact,
  { withoutLogicDelete: true },
);
