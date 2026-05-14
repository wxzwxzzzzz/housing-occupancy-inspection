/**
 * 资源排班 (cn.byteawake.ap.resource) — 休班效果枚举
 * Generated from ontology/byteawake-ap-resource.cn.byteawake.ap.resource.xml
 */

/** 休班效果 */
export const LeaveEffect = {
  TIME_OFF: 'TIME_OFF',
  MAKE_UP_WORKDAY: 'MAKE_UP_WORKDAY',
} as const;
export type LeaveEffect = (typeof LeaveEffect)[keyof typeof LeaveEffect];
