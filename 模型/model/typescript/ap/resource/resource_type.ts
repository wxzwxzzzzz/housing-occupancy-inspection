/**
 * 资源排班 (cn.byteawake.ap.resource) — 资源类型枚举
 * Generated from ontology/byteawake-ap-resource.cn.byteawake.ap.resource.xml
 */

/** 资源类型 */
export const ResourceType = {
  HUMAN: 'HUMAN',
  MATERIAL: 'MATERIAL',
} as const;
export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];
