/**
 * 资源排班 (cn.byteawake.ap.resource) — 时间类型枚举
 * Generated from ontology/byteawake-ap-resource.cn.byteawake.ap.resource.xml
 */

/** 时间类型 */
export const TimeType = {
  LEAVE: 'LEAVE',
  OTHER: 'OTHER',
} as const;
export type TimeType = (typeof TimeType)[keyof typeof TimeType];
