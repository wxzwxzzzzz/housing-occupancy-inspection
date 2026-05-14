/**
 * 字典/枚举工具
 *
 * 项目里所有的 antd Select / Radio / Tag 都通过这里转换,
 * 禁止在页面内硬编码 options 数组。
 *
 * 用法:
 *   import { enumOptions, EnumLabels } from '@/utils/enum-options';
 *   <Select options={enumOptions(Gender, EnumLabels.Gender)} />
 */

import {
  AgeGroup,
  AlertLevel,
  AllocationStatus,
  ApplicationStatus,
  ApplicationType,
  AttendanceMode,
  AttendancePeriod,
  AttendanceStatus,
  AttendanceTimeliness,
  AttendanceType,
  EmploymentAddressType,
  Gender,
  GuaranteeType,
  HouseholdSizeBand,
  HouseholdStatus,
  IncomeType,
  MaritalStatus,
  MemberChangeType,
  RecordStatus,
  ResidenceType,
  ResidentStatus,
  SubsidyStatus,
  TerminationReason,
} from '@/types/ontology/prh/enums';

export interface EnumOption {
  label: string;
  value: string;
}

/** 把 enum 对象 + 标签字典转换成 antd 通用 options */
export function enumOptions(
  enumObj: Record<string, string>,
  labels: Record<string, string>,
): EnumOption[] {
  return Object.values(enumObj).map((value) => ({
    label: labels[value] ?? value,
    value,
  }));
}

/** 找一个 enum value 的中文标签 */
export function enumLabel(
  labels: Record<string, string>,
  value?: string,
  fallback = '-',
): string {
  if (value === undefined || value === null) return fallback;
  return labels[value] ?? value;
}

/** prh 域所有枚举的中文标签 */
export const EnumLabels = {
  Gender: {
    [Gender.MALE]: '男',
    [Gender.FEMALE]: '女',
  },
  MaritalStatus: {
    [MaritalStatus.UNMARRIED]: '未婚',
    [MaritalStatus.MARRIED]: '已婚',
    [MaritalStatus.DIVORCED]: '离异',
    [MaritalStatus.WIDOWED]: '丧偶',
  },
  GuaranteeType: {
    [GuaranteeType.NEW_EMPLOYEE]: '新就业职工',
    [GuaranteeType.MINIMUM_LIVING]: '最低生活保障',
    [GuaranteeType.EXTREME_POVERTY]: '特困',
    [GuaranteeType.LOW_INCOME]: '低收入',
    [GuaranteeType.MIDDLE_INCOME]: '中等收入',
    [GuaranteeType.EXTERNAL_WORKER]: '外来务工',
  },
  ResidentStatus: {
    [ResidentStatus.DRAFT]: '草稿',
    [ResidentStatus.UNVERIFIED]: '待核验',
    [ResidentStatus.VERIFIED]: '已核验',
    [ResidentStatus.ACTIVATED]: '已激活',
    [ResidentStatus.ARCHIVED]: '已归档',
  },
  HouseholdStatus: {
    [HouseholdStatus.DRAFT]: '草稿',
    [HouseholdStatus.ACTIVE]: '生效中',
    [HouseholdStatus.CANDIDATE]: '轮候中',
    [HouseholdStatus.ARCHIVED]: '已归档',
  },
  RecordStatus: {
    [RecordStatus.RECORD_ACTIVE]: '生效中',
    [RecordStatus.RECORD_ARCHIVED]: '已归档',
  },
  ApplicationStatus: {
    [ApplicationStatus.DRAFT]: '草稿',
    [ApplicationStatus.UNDER_APPROVAL]: '审批中',
    [ApplicationStatus.COMPLETED]: '已完成',
    [ApplicationStatus.CANCELLED]: '已撤销',
  },
  ApplicationType: {
    [ApplicationType.INITIAL]: '初次申请',
    [ApplicationType.REACTIVATION]: '重新激活',
    [ApplicationType.ANNUAL_REVIEW]: '年审',
  },
  AttendanceType: {
    [AttendanceType.RESIDENCE]: '居住打卡',
    [AttendanceType.EMPLOYMENT]: '就业打卡',
  },
  AttendanceStatus: {
    [AttendanceStatus.PENDING]: '待打卡',
    [AttendanceStatus.VALID]: '有效',
    [AttendanceStatus.INVALID]: '无效',
    [AttendanceStatus.MISSED]: '缺勤',
    [AttendanceStatus.EXEMPTED]: '豁免',
  },
  AttendanceMode: {
    [AttendanceMode.MINI_PROGRAM]: '小程序',
    [AttendanceMode.KIOSK]: '自助机',
    [AttendanceMode.MANUAL]: '人工录入',
    [AttendanceMode.MAKEUP]: '补卡',
  },
  AttendancePeriod: {
    [AttendancePeriod.WEEKLY]: '每周',
    [AttendancePeriod.BIWEEKLY]: '每两周',
    [AttendancePeriod.MONTHLY]: '每月',
  },
  AttendanceTimeliness: {
    [AttendanceTimeliness.ON_TIME]: '准时',
    [AttendanceTimeliness.LATE]: '迟到',
    [AttendanceTimeliness.MISSED]: '缺勤',
    [AttendanceTimeliness.EXEMPTED]: '豁免',
    [AttendanceTimeliness.PENDING]: '待打卡',
    [AttendanceTimeliness.UNKNOWN]: '未知',
  },
  IncomeType: {
    [IncomeType.SALARY]: '工资性收入',
    [IncomeType.BUSINESS]: '经营性收入',
    [IncomeType.PROPERTY]: '财产性收入',
    [IncomeType.TRANSFER]: '转移性收入',
  },
  AllocationStatus: {
    [AllocationStatus.DRAFT]: '草稿',
    [AllocationStatus.ALLOC_ACTIVE]: '生效中',
    [AllocationStatus.ALLOC_TERMINATED]: '已终止',
    [AllocationStatus.ALLOC_EXPIRED]: '已到期',
  },
  SubsidyStatus: {
    [SubsidyStatus.SUBSIDY_ACTIVE]: '发放中',
    [SubsidyStatus.SUBSIDY_SUSPENDED]: '已暂停',
    [SubsidyStatus.SUBSIDY_TERMINATED]: '已终止',
    [SubsidyStatus.SUBSIDY_EXPIRED]: '已到期',
  },
  TerminationReason: {
    [TerminationReason.VOLUNTARY]: '自愿退出',
    [TerminationReason.INCOME_EXCEED]: '收入超标',
    [TerminationReason.VIOLATION]: '违规',
    [TerminationReason.DECEASED]: '身故',
    [TerminationReason.QUALIFICATION_CANCELLED]: '资格取消',
    [TerminationReason.HOUSING_ACQUIRED]: '已购房',
    [TerminationReason.RENT_ARREARS]: '欠租',
    [TerminationReason.OTHER]: '其他',
  },
  MemberChangeType: {
    [MemberChangeType.ADD_MEMBER]: '新增成员',
    [MemberChangeType.REMOVE_MEMBER]: '移除成员',
  },
  AlertLevel: {
    [AlertLevel.ALERT_INFO]: '提示',
    [AlertLevel.ALERT_WARNING]: '预警',
    [AlertLevel.ALERT_RED]: '红色预警',
  },
  ResidenceType: {
    [ResidenceType.SUBSIDIZED_HOUSING]: '保障性住房',
    [ResidenceType.MARKET_RENTAL]: '市场租赁',
    [ResidenceType.SELF_OWNED]: '自有住房',
    [ResidenceType.MIGRANT_RENTAL]: '外出租赁',
    [ResidenceType.OTHER]: '其他',
  },
  EmploymentAddressType: {
    [EmploymentAddressType.FIXED_WORKPLACE]: '固定工作地点',
    [EmploymentAddressType.FLEXIBLE_EMPLOYMENT]: '灵活就业',
    [EmploymentAddressType.MIGRANT_WORK]: '外出务工',
    [EmploymentAddressType.OTHER]: '其他',
  },
  AgeGroup: {
    [AgeGroup.UNDER_30]: '30 岁以下',
    [AgeGroup.AGE_30_44]: '30-44 岁',
    [AgeGroup.AGE_45_59]: '45-59 岁',
    [AgeGroup.AGE_60_PLUS]: '60 岁及以上',
    [AgeGroup.UNKNOWN]: '未知',
  },
  HouseholdSizeBand: {
    [HouseholdSizeBand.SINGLE_PERSON]: '单人户',
    [HouseholdSizeBand.TWO_PERSON]: '二人户',
    [HouseholdSizeBand.THREE_PERSON]: '三人户',
    [HouseholdSizeBand.FOUR_PLUS_PERSON]: '四人及以上',
    [HouseholdSizeBand.UNKNOWN]: '未知',
  },
} as const;

/** 给 antd Tag 用的颜色映射 */
export const StatusColors = {
  ResidentStatus: {
    [ResidentStatus.DRAFT]: 'default',
    [ResidentStatus.UNVERIFIED]: 'orange',
    [ResidentStatus.VERIFIED]: 'cyan',
    [ResidentStatus.ACTIVATED]: 'green',
    [ResidentStatus.ARCHIVED]: 'default',
  },
  HouseholdStatus: {
    [HouseholdStatus.DRAFT]: 'default',
    [HouseholdStatus.ACTIVE]: 'green',
    [HouseholdStatus.CANDIDATE]: 'blue',
    [HouseholdStatus.ARCHIVED]: 'default',
  },
  ApplicationStatus: {
    [ApplicationStatus.DRAFT]: 'default',
    [ApplicationStatus.UNDER_APPROVAL]: 'processing',
    [ApplicationStatus.COMPLETED]: 'success',
    [ApplicationStatus.CANCELLED]: 'default',
  },
  AttendanceStatus: {
    [AttendanceStatus.PENDING]: 'default',
    [AttendanceStatus.VALID]: 'success',
    [AttendanceStatus.INVALID]: 'error',
    [AttendanceStatus.MISSED]: 'warning',
    [AttendanceStatus.EXEMPTED]: 'cyan',
  },
  AlertLevel: {
    [AlertLevel.ALERT_INFO]: 'blue',
    [AlertLevel.ALERT_WARNING]: 'orange',
    [AlertLevel.ALERT_RED]: 'red',
  },
} as const;
