/**
 * Fact metric → 聚合描述符注册表(mock 端)
 *
 * store.ts 的 applyQuery 检测到 spec.metrics 时,用本表把每个 metricKey 翻成
 * AggSpec,交给 fact-aggregate.ts 的 aggregateRows 做 group by + 聚合。
 *
 * 真实后端(MOCK=none)由 SEMANTIC_MODEL 按 expression 计算 metrics,本表不参与。
 *
 * 字段名以 seed.ts 实际写入 mock 行的字段为准(projectFact 会把源实体字段整体
 * 镜像进 Fact 行,再叠加报表维度别名),因此:
 *   - sum/avg 的源字段用源实体字段名(如 PersonalIncome 的 amount、
 *     HousingAllocation 的 area/rentAmount、RentalSubsidy 的 monthlyAmount)。
 *   - countIf 的状态维度用别名字段(residentStatus / householdStatus / ...)。
 *   - 派生指标(审批时长、请假/务工天数、已提交计数)用 expr 自算,
 *     字段缺失时返回 0,绝不抛错。
 */

import { OT } from '../ontology/object-types';
import type { AggSpec } from './fact-aggregate';

type Row = Record<string, any>;

const DAY_MS = 24 * 60 * 60 * 1000;

function parseTime(v: any): number | null {
  if (v == null || v === '') return null;
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
}

/** 平均审批小时:approvalTime - submittedAt 的均值;缺失行跳过;无有效行返回 0 */
function avgApprovalHours(rows: Row[]): number {
  let sum = 0;
  let n = 0;
  for (const r of rows) {
    const start = parseTime(r.submittedAt);
    const end = parseTime(r.approvalTime);
    if (start == null || end == null) continue;
    sum += (end - start) / 3600000;
    n += 1;
  }
  return n === 0 ? 0 : Math.round((sum / n) * 100) / 100;
}

/** 单行日期跨度天数(end-start);inclusive 时 +1;缺失返回 0 */
function span(start: any, end: any, inclusive: boolean): number {
  const s = parseTime(start);
  const e = parseTime(end);
  if (s == null || e == null) return 0;
  const days = Math.round((e - s) / DAY_MS) + (inclusive ? 1 : 0);
  return Math.max(0, days);
}

/** 天数合计(对满足 keep 的行求 span 之和) */
function sumDays(rows: Row[], inclusive: boolean, keep?: (r: Row) => boolean): number {
  return rows.reduce(
    (a, r) => (!keep || keep(r) ? a + span(r.startDate, r.endDate, inclusive) : a),
    0,
  );
}

/** 平均天数(只统计有起止日期的行) */
function avgDays(rows: Row[], inclusive: boolean): number {
  let sum = 0;
  let n = 0;
  for (const r of rows) {
    if (parseTime(r.startDate) == null || parseTime(r.endDate) == null) continue;
    sum += span(r.startDate, r.endDate, inclusive);
    n += 1;
  }
  return n === 0 ? 0 : Math.round((sum / n) * 100) / 100;
}

/** 非空计数(字段存在且非空串) */
function countPresent(rows: Row[], field: string): number {
  return rows.filter((r) => r[field] != null && r[field] !== '').length;
}

export const factMetricRegistry: Record<string, Record<string, AggSpec>> = {
  // ==========================================================================
  // 档案快照
  // ==========================================================================
  [OT.ResidentSnapshotFact]: {
    residentCount: { fn: 'count' },
    draftResidentCount: { fn: 'countIf', field: 'residentStatus', eq: 'DRAFT' },
    unverifiedResidentCount: { fn: 'countIf', field: 'residentStatus', eq: 'UNVERIFIED' },
    verifiedResidentCount: { fn: 'countIf', field: 'residentStatus', eq: 'VERIFIED' },
    activatedResidentCount: { fn: 'countIf', field: 'residentStatus', eq: 'ACTIVATED' },
    archivedResidentCount: { fn: 'countIf', field: 'residentStatus', eq: 'ARCHIVED' },
  },

  [OT.HouseholdSnapshotFact]: {
    householdCount: { fn: 'count' },
    activeHouseholdCount: { fn: 'countIf', field: 'householdStatus', eq: 'ACTIVE' },
    candidateHouseholdCount: { fn: 'countIf', field: 'householdStatus', eq: 'CANDIDATE' },
    draftHouseholdCount: { fn: 'countIf', field: 'householdStatus', eq: 'DRAFT' },
    archivedHouseholdCount: { fn: 'countIf', field: 'householdStatus', eq: 'ARCHIVED' },
    // 人口数 = sum(householdSize)(源实体 Household.householdSize)
    totalHouseholdPopulation: { fn: 'sum', field: 'householdSize' },
    activeHouseholdPopulation: {
      fn: 'sum',
      field: 'householdSize',
      when: { field: 'householdStatus', eq: 'ACTIVE' },
    },
    candidateHouseholdPopulation: {
      fn: 'sum',
      field: 'householdSize',
      when: { field: 'householdStatus', eq: 'CANDIDATE' },
    },
    archivedHouseholdPopulation: {
      fn: 'sum',
      field: 'householdSize',
      when: { field: 'householdStatus', eq: 'ARCHIVED' },
    },
    avgActiveHouseholdSize: {
      fn: 'avg',
      field: 'householdSize',
      when: { field: 'householdStatus', eq: 'ACTIVE' },
    },
    avgCandidateHouseholdSize: {
      fn: 'avg',
      field: 'householdSize',
      when: { field: 'householdStatus', eq: 'CANDIDATE' },
    },
  },

  [OT.HouseholdMemberSnapshotFact]: {
    memberCount: { fn: 'count' },
    // included 为布尔(alias: r.isIncluded ?? true);matchEq 按字符串比较
    includedMemberCount: { fn: 'countIf', field: 'included', eq: 'true' },
    excludedMemberCount: { fn: 'countIf', field: 'included', eq: 'false' },
    // 已关联居民:member 行带 resident 引用即算关联
    linkedResidentMemberCount: { fn: 'expr', compute: (rows) => countPresent(rows, 'resident') },
  },

  [OT.ResidenceSnapshotFact]: {
    residenceRecordCount: { fn: 'count' },
    activeResidenceRecordCount: { fn: 'countIf', field: 'recordStatus', eq: 'RECORD_ACTIVE' },
    archivedResidenceRecordCount: { fn: 'countIf', field: 'recordStatus', eq: 'RECORD_ARCHIVED' },
    // monitoringTarget 为布尔(alias: r.isMonitoringTarget)
    monitoringResidenceCount: { fn: 'countIf', field: 'monitoringTarget', eq: 'true' },
  },

  [OT.EmploymentSnapshotFact]: {
    employmentRecordCount: { fn: 'count' },
    activeEmploymentRecordCount: { fn: 'countIf', field: 'recordStatus', eq: 'RECORD_ACTIVE' },
    archivedEmploymentRecordCount: { fn: 'countIf', field: 'recordStatus', eq: 'RECORD_ARCHIVED' },
    monitoringEmploymentCount: { fn: 'countIf', field: 'monitoringTarget', eq: 'true' },
  },

  // ==========================================================================
  // 收入与考勤
  // ==========================================================================
  [OT.PersonalIncomeFact]: {
    incomeRecordCount: { fn: 'count' },
    activeIncomeRecordCount: { fn: 'countIf', field: 'recordStatus', eq: 'RECORD_ACTIVE' },
    // 金额源字段是 amount(PersonalIncome.amount),非 incomeAmount
    incomeAmount: { fn: 'sum', field: 'amount' },
    avgIncomeAmount: { fn: 'avg', field: 'amount' },
  },

  [OT.AttendanceFact]: {
    // seedFacts 已预烤 0/1 计数字段,直接 sum 同名字段
    attendanceCount: { fn: 'sum', field: 'attendanceCount' },
    requiredAttendanceCount: { fn: 'sum', field: 'requiredAttendanceCount' },
    validAttendanceCount: { fn: 'sum', field: 'validAttendanceCount' },
    invalidAttendanceCount: { fn: 'sum', field: 'invalidAttendanceCount' },
    missedAttendanceCount: { fn: 'sum', field: 'missedAttendanceCount' },
    exemptedAttendanceCount: { fn: 'sum', field: 'exemptedAttendanceCount' },
    pendingAttendanceCount: { fn: 'sum', field: 'pendingAttendanceCount' },
    makeupAttendanceCount: { fn: 'sum', field: 'makeupAttendanceCount' },
  },

  [OT.LeaveFact]: {
    leaveCount: { fn: 'count' },
    draftLeaveCount: { fn: 'countIf', field: 'leaveStatus', eq: 'DRAFT' },
    underApprovalLeaveCount: { fn: 'countIf', field: 'leaveStatus', eq: 'UNDER_APPROVAL' },
    completedLeaveCount: { fn: 'countIf', field: 'leaveStatus', eq: 'COMPLETED' },
    cancelledLeaveCount: { fn: 'countIf', field: 'leaveStatus', eq: 'CANCELLED' },
    // 请假天数 = sum(endDate - startDate + 1)
    leaveDays: { fn: 'expr', compute: (rows) => sumDays(rows, true) },
    completedLeaveDays: {
      fn: 'expr',
      compute: (rows) => sumDays(rows, true, (r) => String(r.leaveStatus) === 'COMPLETED'),
    },
  },

  [OT.AttendanceMakeupFact]: {
    makeupCount: { fn: 'count' },
    approvedMakeupCount: { fn: 'countIf', field: 'approvalResult', eq: 'APPROVED' },
    rejectedMakeupCount: { fn: 'countIf', field: 'approvalResult', eq: 'REJECTED' },
    returnedMakeupCount: { fn: 'countIf', field: 'approvalResult', eq: 'RETURNED' },
    cancelledMakeupCount: { fn: 'countIf', field: 'makeupStatus', eq: 'CANCELLED' },
    avgApprovalHours: { fn: 'expr', compute: avgApprovalHours },
  },

  // ==========================================================================
  // 业务与变更
  // ==========================================================================
  [OT.EligibilityApplicationFact]: {
    applicationCount: { fn: 'count' },
    // 已提交:带 submittedAt 时间戳即视为已提交(seed 中非草稿才有)
    submittedApplicationCount: { fn: 'expr', compute: (rows) => countPresent(rows, 'submittedAt') },
    underApprovalApplicationCount: {
      fn: 'countIf',
      field: 'applicationStatus',
      eq: 'UNDER_APPROVAL',
    },
    completedApplicationCount: { fn: 'countIf', field: 'applicationStatus', eq: 'COMPLETED' },
    cancelledApplicationCount: { fn: 'countIf', field: 'applicationStatus', eq: 'CANCELLED' },
    approvedApplicationCount: { fn: 'countIf', field: 'approvalResult', eq: 'APPROVED' },
    rejectedApplicationCount: { fn: 'countIf', field: 'approvalResult', eq: 'REJECTED' },
    returnedApplicationCount: { fn: 'countIf', field: 'approvalResult', eq: 'RETURNED' },
    avgApprovalHours: { fn: 'expr', compute: avgApprovalHours },
  },

  [OT.HousingAllocationFact]: {
    allocationCount: { fn: 'count' },
    activeAllocationCount: { fn: 'countIf', field: 'allocationStatus', eq: 'ALLOC_ACTIVE' },
    terminatedAllocationCount: { fn: 'countIf', field: 'allocationStatus', eq: 'ALLOC_TERMINATED' },
    expiredAllocationCount: { fn: 'countIf', field: 'allocationStatus', eq: 'ALLOC_EXPIRED' },
    // 面积源字段 area;月租金源字段 rentAmount(HousingAllocation.rentAmount)
    allocatedArea: { fn: 'sum', field: 'area' },
    activeAllocatedArea: {
      fn: 'sum',
      field: 'area',
      when: { field: 'allocationStatus', eq: 'ALLOC_ACTIVE' },
    },
    monthlyRentAmount: { fn: 'sum', field: 'rentAmount' },
    activeMonthlyRentAmount: {
      fn: 'sum',
      field: 'rentAmount',
      when: { field: 'allocationStatus', eq: 'ALLOC_ACTIVE' },
    },
    avgActiveArea: {
      fn: 'avg',
      field: 'area',
      when: { field: 'allocationStatus', eq: 'ALLOC_ACTIVE' },
    },
    avgActiveMonthlyRent: {
      fn: 'avg',
      field: 'rentAmount',
      when: { field: 'allocationStatus', eq: 'ALLOC_ACTIVE' },
    },
  },

  [OT.RentalSubsidyFact]: {
    subsidyCount: { fn: 'count' },
    activeSubsidyCount: { fn: 'countIf', field: 'subsidyStatus', eq: 'SUBSIDY_ACTIVE' },
    suspendedSubsidyCount: { fn: 'countIf', field: 'subsidyStatus', eq: 'SUBSIDY_SUSPENDED' },
    terminatedSubsidyCount: { fn: 'countIf', field: 'subsidyStatus', eq: 'SUBSIDY_TERMINATED' },
    expiredSubsidyCount: { fn: 'countIf', field: 'subsidyStatus', eq: 'SUBSIDY_EXPIRED' },
    // 月补贴源字段 monthlyAmount(RentalSubsidy.monthlyAmount)
    monthlyEntitlementAmount: { fn: 'sum', field: 'monthlyAmount' },
    activeMonthlyEntitlementAmount: {
      fn: 'sum',
      field: 'monthlyAmount',
      when: { field: 'subsidyStatus', eq: 'SUBSIDY_ACTIVE' },
    },
    avgActiveMonthlyEntitlement: {
      fn: 'avg',
      field: 'monthlyAmount',
      when: { field: 'subsidyStatus', eq: 'SUBSIDY_ACTIVE' },
    },
  },

  [OT.EligibilityTerminationFact]: {
    terminationCount: { fn: 'count' },
    pendingTerminationCount: { fn: 'countIf', field: 'terminationStatus', eq: 'UNDER_APPROVAL' },
    approvedTerminationCount: { fn: 'countIf', field: 'approvalResult', eq: 'APPROVED' },
    rejectedTerminationCount: { fn: 'countIf', field: 'approvalResult', eq: 'REJECTED' },
    returnedTerminationCount: { fn: 'countIf', field: 'approvalResult', eq: 'RETURNED' },
    cancelledTerminationCount: { fn: 'countIf', field: 'terminationStatus', eq: 'CANCELLED' },
    avgApprovalHours: { fn: 'expr', compute: avgApprovalHours },
  },

  [OT.MigrantWorkFact]: {
    migrantWorkCount: { fn: 'count' },
    approvedMigrantWorkCount: { fn: 'countIf', field: 'approvalResult', eq: 'APPROVED' },
    rejectedMigrantWorkCount: { fn: 'countIf', field: 'approvalResult', eq: 'REJECTED' },
    returnedMigrantWorkCount: { fn: 'countIf', field: 'approvalResult', eq: 'RETURNED' },
    // 平均务工天数 = avg(endDate - startDate)
    avgMigrantWorkDays: { fn: 'expr', compute: (rows) => avgDays(rows, false) },
    avgApprovalHours: { fn: 'expr', compute: avgApprovalHours },
  },

  [OT.HouseholdMemberChangeFact]: {
    memberChangeCount: { fn: 'count' },
    addMemberChangeCount: { fn: 'countIf', field: 'changeType', eq: 'ADD_MEMBER' },
    removeMemberChangeCount: { fn: 'countIf', field: 'changeType', eq: 'REMOVE_MEMBER' },
    approvedMemberChangeCount: { fn: 'countIf', field: 'approvalResult', eq: 'APPROVED' },
    rejectedMemberChangeCount: { fn: 'countIf', field: 'approvalResult', eq: 'REJECTED' },
    returnedMemberChangeCount: { fn: 'countIf', field: 'approvalResult', eq: 'RETURNED' },
    avgApprovalHours: { fn: 'expr', compute: avgApprovalHours },
  },

  [OT.ResidenceChangeFact]: {
    residenceChangeCount: { fn: 'count' },
    approvedResidenceChangeCount: { fn: 'countIf', field: 'approvalResult', eq: 'APPROVED' },
    rejectedResidenceChangeCount: { fn: 'countIf', field: 'approvalResult', eq: 'REJECTED' },
    returnedResidenceChangeCount: { fn: 'countIf', field: 'approvalResult', eq: 'RETURNED' },
    avgApprovalHours: { fn: 'expr', compute: avgApprovalHours },
  },

  [OT.EmploymentChangeFact]: {
    employmentChangeCount: { fn: 'count' },
    approvedEmploymentChangeCount: { fn: 'countIf', field: 'approvalResult', eq: 'APPROVED' },
    rejectedEmploymentChangeCount: { fn: 'countIf', field: 'approvalResult', eq: 'REJECTED' },
    returnedEmploymentChangeCount: { fn: 'countIf', field: 'approvalResult', eq: 'RETURNED' },
    avgApprovalHours: { fn: 'expr', compute: avgApprovalHours },
  },
};
