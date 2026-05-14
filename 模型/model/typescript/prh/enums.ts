/**
 * 公租房保障监管 (cn.byteawake.prh) — 枚举
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

// ============================================================================
// 枚举
// ============================================================================

/** 性别 */
export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

/** 婚姻状况 */
export const MaritalStatus = {
  UNMARRIED: 'UNMARRIED',
  MARRIED: 'MARRIED',
  DIVORCED: 'DIVORCED',
  WIDOWED: 'WIDOWED',
} as const;
export type MaritalStatus = (typeof MaritalStatus)[keyof typeof MaritalStatus];

/** 保障类型 */
export const GuaranteeType = {
  NEW_EMPLOYEE: 'NEW_EMPLOYEE',
  MINIMUM_LIVING: 'MINIMUM_LIVING',
  EXTREME_POVERTY: 'EXTREME_POVERTY',
  LOW_INCOME: 'LOW_INCOME',
  MIDDLE_INCOME: 'MIDDLE_INCOME',
  EXTERNAL_WORKER: 'EXTERNAL_WORKER',
} as const;
export type GuaranteeType = (typeof GuaranteeType)[keyof typeof GuaranteeType];

/** 居民状态 */
export const ResidentStatus = {
  DRAFT: 'DRAFT',
  UNVERIFIED: 'UNVERIFIED',
  VERIFIED: 'VERIFIED',
  ACTIVATED: 'ACTIVATED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type ResidentStatus = (typeof ResidentStatus)[keyof typeof ResidentStatus];

/** 保障家庭状态 */
export const HouseholdStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  CANDIDATE: 'CANDIDATE',
  ARCHIVED: 'ARCHIVED',
} as const;
export type HouseholdStatus = (typeof HouseholdStatus)[keyof typeof HouseholdStatus];

/** 记录状态 */
export const RecordStatus = {
  RECORD_ACTIVE: 'RECORD_ACTIVE',
  RECORD_ARCHIVED: 'RECORD_ARCHIVED',
} as const;
export type RecordStatus = (typeof RecordStatus)[keyof typeof RecordStatus];

/** 申请状态 */
export const ApplicationStatus = {
  DRAFT: 'DRAFT',
  UNDER_APPROVAL: 'UNDER_APPROVAL',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

/** 申请类型 */
export const ApplicationType = {
  INITIAL: 'INITIAL',
  REACTIVATION: 'REACTIVATION',
  ANNUAL_REVIEW: 'ANNUAL_REVIEW',
} as const;
export type ApplicationType = (typeof ApplicationType)[keyof typeof ApplicationType];

/** 出勤类型 */
export const AttendanceType = {
  RESIDENCE: 'RESIDENCE',
  EMPLOYMENT: 'EMPLOYMENT',
} as const;
export type AttendanceType = (typeof AttendanceType)[keyof typeof AttendanceType];

/** 考勤状态 */
export const AttendanceStatus = {
  PENDING: 'PENDING',
  VALID: 'VALID',
  INVALID: 'INVALID',
  MISSED: 'MISSED',
  EXEMPTED: 'EXEMPTED',
} as const;
export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

/** 考勤打卡方式 */
export const AttendanceMode = {
  MINI_PROGRAM: 'MINI_PROGRAM',
  KIOSK: 'KIOSK',
  MANUAL: 'MANUAL',
  MAKEUP: 'MAKEUP',
} as const;
export type AttendanceMode = (typeof AttendanceMode)[keyof typeof AttendanceMode];

/** 考核周期 */
export const AttendancePeriod = {
  WEEKLY: 'WEEKLY',
  BIWEEKLY: 'BIWEEKLY',
  MONTHLY: 'MONTHLY',
} as const;
export type AttendancePeriod = (typeof AttendancePeriod)[keyof typeof AttendancePeriod];

/** 收入类型 */
export const IncomeType = {
  SALARY: 'SALARY',
  BUSINESS: 'BUSINESS',
  PROPERTY: 'PROPERTY',
  TRANSFER: 'TRANSFER',
} as const;
export type IncomeType = (typeof IncomeType)[keyof typeof IncomeType];

/** 分配状态 */
export const AllocationStatus = {
  DRAFT: 'DRAFT',
  ALLOC_ACTIVE: 'ALLOC_ACTIVE',
  ALLOC_TERMINATED: 'ALLOC_TERMINATED',
  ALLOC_EXPIRED: 'ALLOC_EXPIRED',
} as const;
export type AllocationStatus = (typeof AllocationStatus)[keyof typeof AllocationStatus];

/** 补贴状态 */
export const SubsidyStatus = {
  SUBSIDY_ACTIVE: 'SUBSIDY_ACTIVE',
  SUBSIDY_SUSPENDED: 'SUBSIDY_SUSPENDED',
  SUBSIDY_TERMINATED: 'SUBSIDY_TERMINATED',
  SUBSIDY_EXPIRED: 'SUBSIDY_EXPIRED',
} as const;
export type SubsidyStatus = (typeof SubsidyStatus)[keyof typeof SubsidyStatus];

/** 退出原因 */
export const TerminationReason = {
  VOLUNTARY: 'VOLUNTARY',
  INCOME_EXCEED: 'INCOME_EXCEED',
  VIOLATION: 'VIOLATION',
  DECEASED: 'DECEASED',
  QUALIFICATION_CANCELLED: 'QUALIFICATION_CANCELLED',
  HOUSING_ACQUIRED: 'HOUSING_ACQUIRED',
  RENT_ARREARS: 'RENT_ARREARS',
  OTHER: 'OTHER',
} as const;
export type TerminationReason = (typeof TerminationReason)[keyof typeof TerminationReason];

/** 成员变更类型 */
export const MemberChangeType = {
  ADD_MEMBER: 'ADD_MEMBER',
  REMOVE_MEMBER: 'REMOVE_MEMBER',
} as const;
export type MemberChangeType = (typeof MemberChangeType)[keyof typeof MemberChangeType];

/** 预警等级 */
export const AlertLevel = {
  ALERT_INFO: 'ALERT_INFO',
  ALERT_WARNING: 'ALERT_WARNING',
  ALERT_RED: 'ALERT_RED',
} as const;
export type AlertLevel = (typeof AlertLevel)[keyof typeof AlertLevel];

/** 居住地址类型 */
export const ResidenceType = {
  SUBSIDIZED_HOUSING: 'SUBSIDIZED_HOUSING',
  MARKET_RENTAL: 'MARKET_RENTAL',
  SELF_OWNED: 'SELF_OWNED',
  MIGRANT_RENTAL: 'MIGRANT_RENTAL',
  OTHER: 'OTHER',
} as const;
export type ResidenceType = (typeof ResidenceType)[keyof typeof ResidenceType];

/** 工作地址类型 */
export const EmploymentAddressType = {
  FIXED_WORKPLACE: 'FIXED_WORKPLACE',
  FLEXIBLE_EMPLOYMENT: 'FLEXIBLE_EMPLOYMENT',
  MIGRANT_WORK: 'MIGRANT_WORK',
  OTHER: 'OTHER',
} as const;
export type EmploymentAddressType = (typeof EmploymentAddressType)[keyof typeof EmploymentAddressType];

/** 年龄分层 */
export const AgeGroup = {
  UNDER_30: 'UNDER_30',
  AGE_30_44: 'AGE_30_44',
  AGE_45_59: 'AGE_45_59',
  AGE_60_PLUS: 'AGE_60_PLUS',
  UNKNOWN: 'UNKNOWN',
} as const;
export type AgeGroup = (typeof AgeGroup)[keyof typeof AgeGroup];

/** 家庭人口规模分层 */
export const HouseholdSizeBand = {
  SINGLE_PERSON: 'SINGLE_PERSON',
  TWO_PERSON: 'TWO_PERSON',
  THREE_PERSON: 'THREE_PERSON',
  FOUR_PLUS_PERSON: 'FOUR_PLUS_PERSON',
  UNKNOWN: 'UNKNOWN',
} as const;
export type HouseholdSizeBand = (typeof HouseholdSizeBand)[keyof typeof HouseholdSizeBand];

/** 考勤准时性 */
export const AttendanceTimeliness = {
  ON_TIME: 'ON_TIME',
  LATE: 'LATE',
  MISSED: 'MISSED',
  EXEMPTED: 'EXEMPTED',
  PENDING: 'PENDING',
  UNKNOWN: 'UNKNOWN',
} as const;
export type AttendanceTimeliness = (typeof AttendanceTimeliness)[keyof typeof AttendanceTimeliness];
