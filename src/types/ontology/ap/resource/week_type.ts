/**
 * 资源排班 (cn.byteawake.ap.resource) — 双周类型枚举
 * Generated from ontology/byteawake-ap-resource.cn.byteawake.ap.resource.xml
 */

/** 双周类型 */
export const WeekType = {
  FIRST: 'FIRST',
  SECOND: 'SECOND',
} as const;
export type WeekType = (typeof WeekType)[keyof typeof WeekType];
