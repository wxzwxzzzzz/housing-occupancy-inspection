/**
 * 本体对象类型常量
 *
 * 全部 objectType 字符串集中在此,杜绝散落硬编码。
 * 服务域命名空间见参考手册"服务域与命名空间"表。
 */

const NS_OMS = 'cn.byteawake.ap.oms';
const NS_OQL = 'cn.byteawake.ap.oql';
const NS_ARCHE = 'cn.byteawake.ap.arche';
const NS_APPROVAL = 'cn.byteawake.ap.approval';
const NS_BASEDOC = 'cn.byteawake.ap.basedoc';
const NS_RESOURCE = 'cn.byteawake.ap.resource';
const NS_PRH = 'cn.byteawake.prh';

export const OT = {
  // ap/arche
  User: `${NS_ARCHE}.User`,
  Tenant: `${NS_ARCHE}.Tenant`,
  Enterprise: `${NS_ARCHE}.Enterprise`,

  // ap/basedoc
  AdministrativeRegion: `${NS_BASEDOC}.AdministrativeRegion`,

  // ap/oms — 平台共享对象
  Fence: `${NS_OMS}.Fence`,
  FenceVertex: `${NS_OMS}.FenceVertex`,

  // ap/resource
  Resource: `${NS_RESOURCE}.Resource`,
  Calendar: `${NS_RESOURCE}.Calendar`,
  CalendarAttendance: `${NS_RESOURCE}.CalendarAttendance`,
  CalendarLeave: `${NS_RESOURCE}.CalendarLeave`,

  // prh — 实体
  Resident: `${NS_PRH}.Resident`,
  Household: `${NS_PRH}.Household`,
  HouseholdMember: `${NS_PRH}.HouseholdMember`,
  HouseholdMemberChange: `${NS_PRH}.HouseholdMemberChange`,
  Residence: `${NS_PRH}.Residence`,
  ResidenceChange: `${NS_PRH}.ResidenceChange`,
  Employment: `${NS_PRH}.Employment`,
  EmploymentChange: `${NS_PRH}.EmploymentChange`,
  PersonalIncome: `${NS_PRH}.PersonalIncome`,
  Attendance: `${NS_PRH}.Attendance`,
  AttendanceSolution: `${NS_PRH}.AttendanceSolution`,
  AttendanceRule: `${NS_PRH}.AttendanceRule`,
  AttendanceMakeup: `${NS_PRH}.AttendanceMakeup`,
  AttendanceMakeupAttachment: `${NS_PRH}.AttendanceMakeupAttachment`,
  Leave: `${NS_PRH}.Leave`,
  LeaveType: `${NS_PRH}.LeaveType`,
  LeaveAttachment: `${NS_PRH}.LeaveAttachment`,
  EligibilityApplication: `${NS_PRH}.EligibilityApplication`,
  EligibilityTermination: `${NS_PRH}.EligibilityTermination`,
  HousingAllocation: `${NS_PRH}.HousingAllocation`,
  RentalSubsidy: `${NS_PRH}.RentalSubsidy`,
  MigrantWork: `${NS_PRH}.MigrantWork`,

  // prh — 事实
  AttendanceFact: `${NS_PRH}.AttendanceFact`,
  AttendanceMakeupFact: `${NS_PRH}.AttendanceMakeupFact`,
  EligibilityApplicationFact: `${NS_PRH}.EligibilityApplicationFact`,
  EligibilityTerminationFact: `${NS_PRH}.EligibilityTerminationFact`,
  EmploymentChangeFact: `${NS_PRH}.EmploymentChangeFact`,
  EmploymentSnapshotFact: `${NS_PRH}.EmploymentSnapshotFact`,
  HouseholdMemberChangeFact: `${NS_PRH}.HouseholdMemberChangeFact`,
  HouseholdMemberSnapshotFact: `${NS_PRH}.HouseholdMemberSnapshotFact`,
  HouseholdSnapshotFact: `${NS_PRH}.HouseholdSnapshotFact`,
  HousingAllocationFact: `${NS_PRH}.HousingAllocationFact`,
  LeaveFact: `${NS_PRH}.LeaveFact`,
  MigrantWorkFact: `${NS_PRH}.MigrantWorkFact`,
  PersonalIncomeFact: `${NS_PRH}.PersonalIncomeFact`,
  RentalSubsidyFact: `${NS_PRH}.RentalSubsidyFact`,
  ResidenceChangeFact: `${NS_PRH}.ResidenceChangeFact`,
  ResidenceSnapshotFact: `${NS_PRH}.ResidenceSnapshotFact`,
  ResidentSnapshotFact: `${NS_PRH}.ResidentSnapshotFact`,
} as const;

export type ObjectType = (typeof OT)[keyof typeof OT];

export const NS = {
  OMS: NS_OMS,
  OQL: NS_OQL,
  ARCHE: NS_ARCHE,
  APPROVAL: NS_APPROVAL,
  BASEDOC: NS_BASEDOC,
  RESOURCE: NS_RESOURCE,
  PRH: NS_PRH,
} as const;
