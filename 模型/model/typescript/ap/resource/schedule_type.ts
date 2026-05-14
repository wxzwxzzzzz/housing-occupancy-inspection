/**
 * 资源排班 (cn.byteawake.ap.resource) — 调度类型枚举
 * Generated from ontology/byteawake-ap-resource.cn.byteawake.ap.resource.xml
 */

/** 调度类型 */
export const ScheduleType = {
  FIXED: 'FIXED',
  FLEXIBLE: 'FLEXIBLE',
} as const;
export type ScheduleType = (typeof ScheduleType)[keyof typeof ScheduleType];
