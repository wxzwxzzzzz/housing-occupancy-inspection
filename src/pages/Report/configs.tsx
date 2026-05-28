/**
 * 报表配置中心 — 17 个 Fact 的字段元数据
 *
 * 每个 reportConfig 对应一个 Fact 类(SEMANTIC_MODEL),
 * 一处定义,routes/menu/page 三方共用。
 */

import type { FactDimension, FactMetric } from '@/components/FactPage';
import { factService } from '@/services/domains/facts';
import type { EntityApi } from '@/services/ontology/crud';
import { dictLabel } from '@/stores/dictStore';
import type { EnumLabels } from '@/utils/enum-options';

export interface ReportConfig {
  key: string;
  path: string;
  title: string;
  /** 父分组:用于菜单/面包屑 */
  group: '档案快照' | '收入与考勤' | '业务与变更';
  factService: EntityApi<any>;
  dimensions: FactDimension[];
  metrics: FactMetric[];
}

const dictDim = (
  key: string,
  label: string,
  dictName: keyof typeof EnumLabels,
): FactDimension => ({
  key,
  label,
  render: (v) => dictLabel(dictName, v as string),
});

// ============================================================================
// 档案快照
// ============================================================================

const residentSnapshot: ReportConfig = {
  key: 'residentSnapshot',
  path: '/report/resident-snapshot',
  title: '居民快照',
  group: '档案快照',
  factService: factService.residentSnapshot as any,
  dimensions: [
    dictDim('gender', '性别', 'Gender'),
    dictDim('ageGroup', '年龄段', 'AgeGroup'),
    dictDim('maritalStatus', '婚姻状况', 'MaritalStatus'),
    dictDim('guaranteeType', '保障类型', 'GuaranteeType'),
    dictDim('residentStatus', '居民状态', 'ResidentStatus'),
    dictDim('archiveReason', '归档原因', 'TerminationReason'),
    { key: 'archiveDate', label: '归档日期' },
  ],
  metrics: [
    { key: 'residentCount', label: '居民总数', format: 'integer' },
    { key: 'draftResidentCount', label: '草稿', format: 'integer' },
    { key: 'unverifiedResidentCount', label: '未认证', format: 'integer' },
    { key: 'verifiedResidentCount', label: '已认证', format: 'integer' },
    { key: 'activatedResidentCount', label: '已激活', format: 'integer' },
    { key: 'archivedResidentCount', label: '已退出', format: 'integer' },
  ],
};

const householdSnapshot: ReportConfig = {
  key: 'householdSnapshot',
  path: '/report/household-snapshot',
  title: '家庭快照',
  group: '档案快照',
  factService: factService.householdSnapshot as any,
  dimensions: [
    dictDim('guaranteeType', '保障类型', 'GuaranteeType'),
    dictDim('householdStatus', '家庭状态', 'HouseholdStatus'),
    { key: 'householdSize', label: '家庭人口数' },
    dictDim('householdSizeBand', '人口规模分层', 'HouseholdSizeBand'),
    { key: 'waitlistNo', label: '轮候序号' },
    dictDim('applicantGender', '主申请人性别', 'Gender'),
    dictDim('applicantAgeGroup', '主申请人年龄段', 'AgeGroup'),
    dictDim('applicantMaritalStatus', '主申请人婚姻', 'MaritalStatus'),
    dictDim('applicantResidentStatus', '主申请人状态', 'ResidentStatus'),
    dictDim('archiveReason', '归档原因', 'TerminationReason'),
    { key: 'archiveDate', label: '归档日期' },
    { key: 'createdAt', label: '建档时间' },
  ],
  metrics: [
    { key: 'householdCount', label: '家庭总数', format: 'integer' },
    { key: 'activeHouseholdCount', label: '在保家庭', format: 'integer' },
    { key: 'candidateHouseholdCount', label: '候选家庭', format: 'integer' },
    { key: 'draftHouseholdCount', label: '草稿', format: 'integer' },
    { key: 'archivedHouseholdCount', label: '已退出', format: 'integer' },
    { key: 'totalHouseholdPopulation', label: '系统内人口', format: 'integer' },
    { key: 'activeHouseholdPopulation', label: '在保人口', format: 'integer' },
    {
      key: 'candidateHouseholdPopulation',
      label: '候选人口',
      format: 'integer',
    },
    {
      key: 'archivedHouseholdPopulation',
      label: '已退出人口',
      format: 'integer',
    },
    { key: 'avgActiveHouseholdSize', label: '在保平均人口', format: 'decimal' },
    {
      key: 'avgCandidateHouseholdSize',
      label: '候选平均人口',
      format: 'decimal',
    },
  ],
};

const householdMemberSnapshot: ReportConfig = {
  key: 'householdMemberSnapshot',
  path: '/report/household-member-snapshot',
  title: '家庭成员快照',
  group: '档案快照',
  factService: factService.householdMemberSnapshot as any,
  dimensions: [
    { key: 'relationship', label: '与申请人关系' },
    { key: 'included', label: '是否计入人口' },
    dictDim('householdGuaranteeType', '家庭保障类型', 'GuaranteeType'),
    dictDim('householdStatus', '家庭状态', 'HouseholdStatus'),
    dictDim('residentStatus', '居民状态', 'ResidentStatus'),
    { key: 'joinedAt', label: '加入时间' },
  ],
  metrics: [
    { key: 'memberCount', label: '成员总数', format: 'integer' },
    { key: 'includedMemberCount', label: '计入人口', format: 'integer' },
    { key: 'excludedMemberCount', label: '不计入人口', format: 'integer' },
    {
      key: 'linkedResidentMemberCount',
      label: '已关联居民',
      format: 'integer',
    },
  ],
};

const residenceSnapshot: ReportConfig = {
  key: 'residenceSnapshot',
  path: '/report/residence-snapshot',
  title: '居住信息快照',
  group: '档案快照',
  factService: factService.residenceSnapshot as any,
  dimensions: [
    dictDim('residenceType', '居住类型', 'ResidenceType'),
    { key: 'residenceRegion', label: '行政区划' },
    { key: 'monitoringTarget', label: '监测目标' },
    dictDim('recordStatus', '记录状态', 'RecordStatus'),
    { key: 'effectiveDate', label: '生效日期' },
    { key: 'archiveDate', label: '归档日期' },
  ],
  metrics: [
    { key: 'residenceRecordCount', label: '居住记录数', format: 'integer' },
    { key: 'activeResidenceRecordCount', label: '生效中', format: 'integer' },
    { key: 'archivedResidenceRecordCount', label: '已归档', format: 'integer' },
    { key: 'monitoringResidenceCount', label: '监测目标', format: 'integer' },
  ],
};

const employmentSnapshot: ReportConfig = {
  key: 'employmentSnapshot',
  path: '/report/employment-snapshot',
  title: '工作信息快照',
  group: '档案快照',
  factService: factService.employmentSnapshot as any,
  dimensions: [
    dictDim('employmentAddressType', '工作类型', 'EmploymentAddressType'),
    { key: 'employmentRegion', label: '行政区划' },
    { key: 'monitoringTarget', label: '监测目标' },
    dictDim('recordStatus', '记录状态', 'RecordStatus'),
    { key: 'effectiveDate', label: '生效日期' },
    { key: 'archiveDate', label: '归档日期' },
  ],
  metrics: [
    { key: 'employmentRecordCount', label: '工作记录数', format: 'integer' },
    { key: 'activeEmploymentRecordCount', label: '生效中', format: 'integer' },
    {
      key: 'archivedEmploymentRecordCount',
      label: '已归档',
      format: 'integer',
    },
    { key: 'monitoringEmploymentCount', label: '监测目标', format: 'integer' },
  ],
};

// ============================================================================
// 收入与考勤
// ============================================================================

const personalIncome: ReportConfig = {
  key: 'personalIncome',
  path: '/report/personal-income',
  title: '个人收入',
  group: '收入与考勤',
  factService: factService.personalIncome as any,
  dimensions: [
    dictDim('incomeType', '收入类型', 'IncomeType'),
    { key: 'period', label: '所属期间' },
    dictDim('recordStatus', '记录状态', 'RecordStatus'),
  ],
  metrics: [
    { key: 'incomeRecordCount', label: '收入记录数', format: 'integer' },
    { key: 'activeIncomeRecordCount', label: '生效记录', format: 'integer' },
    { key: 'incomeAmount', label: '收入合计', format: 'currency' },
    { key: 'avgIncomeAmount', label: '平均收入', format: 'currency' },
  ],
};

const attendance: ReportConfig = {
  key: 'attendance',
  path: '/report/attendance',
  title: '考勤打卡',
  group: '收入与考勤',
  factService: factService.attendance as any,
  dimensions: [
    dictDim('attendanceType', '出勤类型', 'AttendanceType'),
    dictDim('attendanceMode', '打卡方式', 'AttendanceMode'),
    dictDim('attendanceStatus', '考勤状态', 'AttendanceStatus'),
    dictDim('attendanceTimeliness', '准时性', 'AttendanceTimeliness'),
    { key: 'checkIn', label: '打卡时间' },
    { key: 'deadline', label: '截止时间' },
  ],
  metrics: [
    { key: 'attendanceCount', label: '考勤任务', format: 'integer' },
    { key: 'requiredAttendanceCount', label: '应打卡', format: 'integer' },
    { key: 'validAttendanceCount', label: '有效', format: 'integer' },
    { key: 'invalidAttendanceCount', label: '无效', format: 'integer' },
    { key: 'missedAttendanceCount', label: '缺勤', format: 'integer' },
    { key: 'exemptedAttendanceCount', label: '豁免', format: 'integer' },
    { key: 'pendingAttendanceCount', label: '待打卡', format: 'integer' },
    { key: 'makeupAttendanceCount', label: '补卡', format: 'integer' },
  ],
};

const leave: ReportConfig = {
  key: 'leave',
  path: '/report/leave',
  title: '请假',
  group: '收入与考勤',
  factService: factService.leave as any,
  dimensions: [
    dictDim('leaveStatus', '申请状态', 'ApplicationStatus'),
    { key: 'startDate', label: '开始日期' },
    { key: 'endDate', label: '结束日期' },
  ],
  metrics: [
    { key: 'leaveCount', label: '请假数', format: 'integer' },
    { key: 'draftLeaveCount', label: '草稿', format: 'integer' },
    { key: 'underApprovalLeaveCount', label: '审批中', format: 'integer' },
    { key: 'completedLeaveCount', label: '已批准', format: 'integer' },
    { key: 'cancelledLeaveCount', label: '已撤销', format: 'integer' },
    { key: 'leaveDays', label: '请假天数', format: 'decimal' },
    { key: 'completedLeaveDays', label: '生效天数', format: 'decimal' },
  ],
};

const attendanceMakeup: ReportConfig = {
  key: 'attendanceMakeup',
  path: '/report/attendance-makeup',
  title: '补卡申请',
  group: '收入与考勤',
  factService: factService.attendanceMakeup as any,
  dimensions: [
    dictDim('makeupStatus', '申请状态', 'ApplicationStatus'),
    { key: 'approvalResult', label: '审批结果' },
    dictDim('targetAttendanceType', '目标考勤类型', 'AttendanceType'),
    dictDim('targetAttendanceStatus', '目标考勤状态', 'AttendanceStatus'),
    { key: 'submittedAt', label: '提交时间' },
    { key: 'approvalTime', label: '审批时间' },
  ],
  metrics: [
    { key: 'makeupCount', label: '补卡申请', format: 'integer' },
    { key: 'approvedMakeupCount', label: '通过', format: 'integer' },
    { key: 'rejectedMakeupCount', label: '驳回', format: 'integer' },
    { key: 'returnedMakeupCount', label: '退回', format: 'integer' },
    { key: 'cancelledMakeupCount', label: '已取消', format: 'integer' },
    { key: 'avgApprovalHours', label: '平均审批小时', format: 'decimal' },
  ],
};

// ============================================================================
// 业务与变更
// ============================================================================

const eligibilityApplication: ReportConfig = {
  key: 'eligibilityApplication',
  path: '/report/eligibility-application',
  title: '资质申请',
  group: '业务与变更',
  factService: factService.eligibilityApplication as any,
  dimensions: [
    dictDim('applicationType', '申请类型', 'ApplicationType'),
    dictDim('guaranteeType', '保障类型', 'GuaranteeType'),
    dictDim('applicationStatus', '申请状态', 'ApplicationStatus'),
    { key: 'approvalResult', label: '审批结果' },
    { key: 'approvalStep', label: '审批环节' },
    { key: 'submittedAt', label: '提交时间' },
    { key: 'approvalTime', label: '审批时间' },
  ],
  metrics: [
    { key: 'applicationCount', label: '申请总数', format: 'integer' },
    { key: 'submittedApplicationCount', label: '已提交', format: 'integer' },
    {
      key: 'underApprovalApplicationCount',
      label: '审批中',
      format: 'integer',
    },
    { key: 'completedApplicationCount', label: '已完成', format: 'integer' },
    { key: 'cancelledApplicationCount', label: '已取消', format: 'integer' },
    { key: 'approvedApplicationCount', label: '通过', format: 'integer' },
    { key: 'rejectedApplicationCount', label: '驳回', format: 'integer' },
    { key: 'returnedApplicationCount', label: '退回', format: 'integer' },
    { key: 'avgApprovalHours', label: '平均审批小时', format: 'decimal' },
  ],
};

const housingAllocation: ReportConfig = {
  key: 'housingAllocation',
  path: '/report/housing-allocation',
  title: '实物配租',
  group: '业务与变更',
  factService: factService.housingAllocation as any,
  dimensions: [
    { key: 'projectName', label: '项目名称' },
    { key: 'buildingNo', label: '楼栋号' },
    dictDim('allocationStatus', '分配状态', 'AllocationStatus'),
    { key: 'leaseStartDate', label: '起租日期' },
    { key: 'leaseEndDate', label: '到期日期' },
  ],
  metrics: [
    { key: 'allocationCount', label: '配租数', format: 'integer' },
    { key: 'activeAllocationCount', label: '生效中', format: 'integer' },
    { key: 'terminatedAllocationCount', label: '已终止', format: 'integer' },
    { key: 'expiredAllocationCount', label: '已到期', format: 'integer' },
    { key: 'allocatedArea', label: '总分配面积', format: 'decimal' },
    { key: 'activeAllocatedArea', label: '生效面积', format: 'decimal' },
    { key: 'monthlyRentAmount', label: '月租金合计', format: 'currency' },
    { key: 'activeMonthlyRentAmount', label: '生效月租金', format: 'currency' },
    { key: 'avgActiveArea', label: '平均面积', format: 'decimal' },
    { key: 'avgActiveMonthlyRent', label: '平均月租金', format: 'currency' },
  ],
};

const rentalSubsidy: ReportConfig = {
  key: 'rentalSubsidy',
  path: '/report/rental-subsidy',
  title: '租赁补贴',
  group: '业务与变更',
  factService: factService.rentalSubsidy as any,
  dimensions: [
    dictDim('subsidyStatus', '补贴状态', 'SubsidyStatus'),
    { key: 'startDate', label: '起始日期' },
    { key: 'endDate', label: '截止日期' },
  ],
  metrics: [
    { key: 'subsidyCount', label: '补贴数', format: 'integer' },
    { key: 'activeSubsidyCount', label: '发放中', format: 'integer' },
    { key: 'suspendedSubsidyCount', label: '已暂停', format: 'integer' },
    { key: 'terminatedSubsidyCount', label: '已终止', format: 'integer' },
    { key: 'expiredSubsidyCount', label: '已到期', format: 'integer' },
    {
      key: 'monthlyEntitlementAmount',
      label: '月补贴合计',
      format: 'currency',
    },
    {
      key: 'activeMonthlyEntitlementAmount',
      label: '生效月补贴',
      format: 'currency',
    },
    {
      key: 'avgActiveMonthlyEntitlement',
      label: '平均月补贴',
      format: 'currency',
    },
  ],
};

const eligibilityTermination: ReportConfig = {
  key: 'eligibilityTermination',
  path: '/report/eligibility-termination',
  title: '资格终止',
  group: '业务与变更',
  factService: factService.eligibilityTermination as any,
  dimensions: [
    dictDim('terminationType', '终止类型', 'TerminationReason'),
    dictDim('terminationStatus', '申请状态', 'ApplicationStatus'),
    { key: 'approvalResult', label: '审批结果' },
    { key: 'effectiveDate', label: '期望生效日期' },
  ],
  metrics: [
    { key: 'terminationCount', label: '终止申请', format: 'integer' },
    { key: 'pendingTerminationCount', label: '审批中', format: 'integer' },
    { key: 'approvedTerminationCount', label: '通过', format: 'integer' },
    { key: 'rejectedTerminationCount', label: '驳回', format: 'integer' },
    { key: 'returnedTerminationCount', label: '退回', format: 'integer' },
    { key: 'cancelledTerminationCount', label: '已取消', format: 'integer' },
    { key: 'avgApprovalHours', label: '平均审批小时', format: 'decimal' },
  ],
};

const migrantWork: ReportConfig = {
  key: 'migrantWork',
  path: '/report/migrant-work',
  title: '外出务工申请',
  group: '业务与变更',
  factService: factService.migrantWork as any,
  dimensions: [
    { key: 'residentAddressRegion', label: '务工居住区划' },
    { key: 'companyAddressRegion', label: '工作区划' },
    dictDim('migrantWorkStatus', '申请状态', 'ApplicationStatus'),
    { key: 'approvalResult', label: '审批结果' },
    { key: 'startDate', label: '开始日期' },
    { key: 'endDate', label: '结束日期' },
  ],
  metrics: [
    { key: 'migrantWorkCount', label: '申请数', format: 'integer' },
    { key: 'approvedMigrantWorkCount', label: '通过', format: 'integer' },
    { key: 'rejectedMigrantWorkCount', label: '驳回', format: 'integer' },
    { key: 'returnedMigrantWorkCount', label: '退回', format: 'integer' },
    { key: 'avgMigrantWorkDays', label: '平均务工天数', format: 'decimal' },
    { key: 'avgApprovalHours', label: '平均审批小时', format: 'decimal' },
  ],
};

const householdMemberChange: ReportConfig = {
  key: 'householdMemberChange',
  path: '/report/household-member-change',
  title: '家庭成员变更',
  group: '业务与变更',
  factService: factService.householdMemberChange as any,
  dimensions: [
    dictDim('changeType', '变更类型', 'MemberChangeType'),
    dictDim('changeStatus', '申请状态', 'ApplicationStatus'),
    { key: 'approvalResult', label: '审批结果' },
    { key: 'memberRelationship', label: '目标成员关系' },
    { key: 'memberIncluded', label: '目标成员是否计入人口' },
  ],
  metrics: [
    { key: 'memberChangeCount', label: '变更数', format: 'integer' },
    { key: 'addMemberChangeCount', label: '新增', format: 'integer' },
    { key: 'removeMemberChangeCount', label: '移除', format: 'integer' },
    { key: 'approvedMemberChangeCount', label: '通过', format: 'integer' },
    { key: 'rejectedMemberChangeCount', label: '驳回', format: 'integer' },
    { key: 'returnedMemberChangeCount', label: '退回', format: 'integer' },
    { key: 'avgApprovalHours', label: '平均审批小时', format: 'decimal' },
  ],
};

const residenceChange: ReportConfig = {
  key: 'residenceChange',
  path: '/report/residence-change',
  title: '居住地址变更',
  group: '业务与变更',
  factService: factService.residenceChange as any,
  dimensions: [
    { key: 'residenceRegion', label: '新居住区划' },
    dictDim('changeStatus', '申请状态', 'ApplicationStatus'),
    { key: 'approvalResult', label: '审批结果' },
  ],
  metrics: [
    { key: 'residenceChangeCount', label: '变更数', format: 'integer' },
    { key: 'approvedResidenceChangeCount', label: '通过', format: 'integer' },
    { key: 'rejectedResidenceChangeCount', label: '驳回', format: 'integer' },
    { key: 'returnedResidenceChangeCount', label: '退回', format: 'integer' },
    { key: 'avgApprovalHours', label: '平均审批小时', format: 'decimal' },
  ],
};

const employmentChange: ReportConfig = {
  key: 'employmentChange',
  path: '/report/employment-change',
  title: '工作地址变更',
  group: '业务与变更',
  factService: factService.employmentChange as any,
  dimensions: [
    { key: 'employmentRegion', label: '工作区划' },
    dictDim('changeStatus', '申请状态', 'ApplicationStatus'),
    { key: 'approvalResult', label: '审批结果' },
  ],
  metrics: [
    { key: 'employmentChangeCount', label: '变更数', format: 'integer' },
    { key: 'approvedEmploymentChangeCount', label: '通过', format: 'integer' },
    { key: 'rejectedEmploymentChangeCount', label: '驳回', format: 'integer' },
    { key: 'returnedEmploymentChangeCount', label: '退回', format: 'integer' },
    { key: 'avgApprovalHours', label: '平均审批小时', format: 'decimal' },
  ],
};

export const reportConfigs: Record<string, ReportConfig> = {
  residentSnapshot,
  householdSnapshot,
  householdMemberSnapshot,
  residenceSnapshot,
  employmentSnapshot,
  personalIncome,
  attendance,
  leave,
  attendanceMakeup,
  eligibilityApplication,
  housingAllocation,
  rentalSubsidy,
  eligibilityTermination,
  migrantWork,
  householdMemberChange,
  residenceChange,
  employmentChange,
};

export const reportList: ReportConfig[] = Object.values(reportConfigs);
