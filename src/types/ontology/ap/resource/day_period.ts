/**
 * 资源排班 (cn.byteawake.ap.resource) — 日内时段枚举
 * Generated from ontology/byteawake-ap-resource.cn.byteawake.ap.resource.xml
 */

/** 日内时段 */
export const DayPeriod = {
  MORNING: 'MORNING',
  BREAK: 'BREAK',
  AFTERNOON: 'AFTERNOON',
  FULL_DAY: 'FULL_DAY',
} as const;
export type DayPeriod = (typeof DayPeriod)[keyof typeof DayPeriod];
