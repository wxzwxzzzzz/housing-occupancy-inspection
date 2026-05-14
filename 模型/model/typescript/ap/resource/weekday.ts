/**
 * 资源排班 (cn.byteawake.ap.resource) — 星期枚举
 * Generated from ontology/byteawake-ap-resource.cn.byteawake.ap.resource.xml
 */

/** 星期 */
export const Weekday = {
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY',
} as const;
export type Weekday = (typeof Weekday)[keyof typeof Weekday];
