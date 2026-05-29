/**
 * Mock 种子数据生成器
 *
 * 一次性生成所有实体的关联数据,保证:
 *  - Resident ↔ Household 互引一致
 *  - Attendance.resident 是已有 Resident
 *  - Fact 派生自原始实体
 *  - 部分 Attendance 故意失败,触发 AlertList 看到红色预警
 */

import { OT } from '../ontology/object-types';
import { insert, table, findAll, findById, applyQuery } from './store';

let seedDone = false;

export function ensureSeeded() {
  if (seedDone) return;
  seedDone = true;

  seedRegions();
  seedTenant();
  seedUsers();
  seedResidents();
  seedHouseholds();
  seedHouseholdMembers();
  seedResidences();
  seedEmployments();
  seedPersonalIncome();
  seedAttendanceSolution();
  seedAttendanceRules();
  seedAttendances();
  seedLeaveTypes();
  seedLeaves();
  seedMigrantWorks();
  seedEligibilityApplications();
  seedHousingAllocations();
  seedRentalSubsidies();
  seedAttendanceMakeups();
  seedChanges();
  seedFacts();
  seedNotifications();
  seedSysConfig();
  seedSavedFilters();
  seedApprovalFlows();
  seedApprovalRecords();
  seedSystem();
  seedFences();
}

// -------------------- 行政区划 --------------------
function seedRegions() {
  const list = [
    { code: 'GZ', name: '广州市', parent: '', regionType: 'MUNICIPALITY', level: 1, path: '/GZ' },
    { code: 'TH', name: '天河区', parent: 'GZ', regionType: 'DISTRICT', level: 2, path: '/GZ/TH' },
    { code: 'YX', name: '越秀区', parent: 'GZ', regionType: 'DISTRICT', level: 2, path: '/GZ/YX' },
    { code: 'HZ', name: '海珠区', parent: 'GZ', regionType: 'DISTRICT', level: 2, path: '/GZ/HZ' },
    { code: 'BY', name: '白云区', parent: 'GZ', regionType: 'DISTRICT', level: 2, path: '/GZ/BY' },
  ];
  list.forEach((r) =>
    insert(OT.AdministrativeRegion, {
      ...r,
      nationalCode: r.code,
      countryCode: 'CN',
      enable: true,
    }, { id: r.code }),
  );
}

// -------------------- 租户/用户 --------------------
function seedTenant() {
  insert(OT.Tenant, {
    name: '广州市住房保障管理中心',
    status: 'ACTIVE',
  }, { id: 'default' });
}

function seedUsers() {
  insert(OT.User, {
    account: 'admin',
    password: '123456',
    fullName: '系统管理员',
    phone: '13800000000',
    email: 'admin@prh.test',
    status: 'ACTIVE',
    userType: 'ADMIN',
    isAnonymous: false,
    isSSOUser: false,
    emailChangeStatus: 'NONE',
  }, { id: 'user-admin' });
  insert(OT.User, {
    account: 'approver',
    password: '123456',
    fullName: '王审批',
    phone: '13800000001',
    status: 'ACTIVE',
    userType: 'APPROVER',
    isAnonymous: false,
    isSSOUser: false,
    emailChangeStatus: 'NONE',
  }, { id: 'user-approver' });
  insert(OT.User, {
    account: 'staff',
    password: '123456',
    fullName: '李工作',
    phone: '13800000002',
    status: 'ACTIVE',
    userType: 'STAFF',
    isAnonymous: false,
    isSSOUser: false,
    emailChangeStatus: 'NONE',
  }, { id: 'user-staff' });
}

// -------------------- 居民 --------------------
const FIRST_NAMES = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛'];
const SURNAMES = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡'];
const REGION_CODES = ['TH', 'YX', 'HZ', 'BY'];

function seedResidents() {
  for (let i = 0; i < 50; i++) {
    const surname = SURNAMES[i % SURNAMES.length];
    const given = FIRST_NAMES[(i + 3) % FIRST_NAMES.length];
    const fullName = surname + given;
    const idCardNo = `4401${String(20000000 + i * 137).padStart(8, '0')}${String(1000 + i).padStart(4, '0')}`;
    const phone = `1${[3, 5, 7, 8, 9][i % 5]}${String(800000000 + i * 1234567).slice(0, 9)}`;
    const status = i < 5 ? 'DRAFT' : i < 10 ? 'UNVERIFIED' : i < 15 ? 'VERIFIED' : i < 45 ? 'ACTIVATED' : 'ARCHIVED';
    insert(OT.Resident, {
      fullName,
      idCardNo,
      phone,
      email: `resident${i}@prh.test`,
      gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
      birthDate: `19${60 + (i % 35)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      maritalStatus: i % 3 === 0 ? 'MARRIED' : i % 3 === 1 ? 'UNMARRIED' : 'DIVORCED',
      guaranteeType: ['NEW_EMPLOYEE', 'MINIMUM_LIVING', 'EXTREME_POVERTY', 'LOW_INCOME', 'MIDDLE_INCOME', 'EXTERNAL_WORKER'][i % 6],
      status,
      facePhoto: `https://picsum.photos/seed/face${i}/200/200`,
    }, { id: `resident-${i + 1}` });
  }
}

// -------------------- 保障家庭 --------------------
function seedHouseholds() {
  for (let i = 0; i < 20; i++) {
    const applicantId = `resident-${i + 1}`;
    const applicant = table(OT.Resident).get(applicantId)!;
    insert(OT.Household, {
      applicantName: applicant.fullName,
      applicant: applicantId,
      guaranteeType: applicant.guaranteeType,
      householdSize: 1 + (i % 4),
      status: i < 15 ? 'ACTIVE' : i < 18 ? 'CANDIDATE' : 'ARCHIVED',
      waitlistNo: i + 100,
    }, { id: `household-${i + 1}` });
  }
}

function seedHouseholdMembers() {
  // 给前 10 个家庭添加 1~2 个成员
  for (let i = 0; i < 10; i++) {
    const householdId = `household-${i + 1}`;
    const memberCount = 1 + (i % 2);
    for (let m = 0; m < memberCount; m++) {
      const residentIdx = 21 + i * 2 + m;
      if (residentIdx > 50) break;
      insert(OT.HouseholdMember, {
        household: householdId,
        resident: `resident-${residentIdx}`,
        relation: ['SPOUSE', 'CHILD', 'PARENT'][m % 3],
        joinedAt: '2025-01-01',
      });
    }
  }
}

// -------------------- 居住地址 --------------------
function seedResidences() {
  for (let i = 0; i < 30; i++) {
    insert(OT.Residence, {
      resident: `resident-${i + 1}`,
      addressType: ['SUBSIDIZED_HOUSING', 'MARKET_RENTAL', 'SELF_OWNED'][i % 3],
      address: {
        region: REGION_CODES[i % REGION_CODES.length],
        detail: `广州市${['天河区', '越秀区', '海珠区', '白云区'][i % 4]}保障花园${i + 1}号楼${(i % 6) + 1}单元${(i % 9) + 1}0${(i % 8) + 2}`,
        geoPoint: { longitude: 113.27 + (i % 10) * 0.01, latitude: 23.13 + (i % 10) * 0.005 },
      },
      // 给第 1 条居住记录绑上现成的圆形围栏(供 ResidentFencePanel 演示)
      fence: i === 0 ? 'fence-circle-1' : undefined,
      isMonitoringTarget: i % 3 === 0,
      effectiveDate: '2025-01-01',
      status: 'RECORD_ACTIVE',
    });
  }
}

// -------------------- 就业 --------------------
function seedEmployments() {
  for (let i = 0; i < 25; i++) {
    insert(OT.Employment, {
      resident: `resident-${i + 1}`,
      addressType: ['FIXED_WORKPLACE', 'FLEXIBLE_EMPLOYMENT', 'MIGRANT_WORK'][i % 3],
      employer: `广州${['科技', '商贸', '服务', '物流'][i % 4]}有限公司`,
      position: ['工程师', '销售', '客服', '司机', '前台'][i % 5],
      monthlyIncome: 4000 + (i % 10) * 500,
      effectiveFrom: '2025-01-01',
      recordStatus: 'RECORD_ACTIVE',
    });
  }
}

function seedPersonalIncome() {
  for (let i = 0; i < 30; i++) {
    insert(OT.PersonalIncome, {
      resident: `resident-${i + 1}`,
      incomeType: ['SALARY', 'BUSINESS', 'PROPERTY', 'TRANSFER'][i % 4],
      amount: 3000 + (i % 20) * 500,
      reportPeriod: '2026-04',
    });
  }
}

// -------------------- 考勤方案/规则 --------------------
function seedAttendanceSolution() {
  insert(OT.AttendanceSolution, {
    name: '默认打卡方案',
    period: 'WEEKLY',
    requiredCount: 3,
    enable: true,
  }, { id: 'solution-default' });
}

function seedAttendanceRules() {
  insert(OT.AttendanceRule, {
    name: '位置偏离阈值',
    solution: 'solution-default',
    metric: 'LOCATION_DEVIATION',
    threshold: 200,
    unit: 'meters',
  }, { id: 'rule-location' });
  insert(OT.AttendanceRule, {
    name: '人脸匹配最低分',
    solution: 'solution-default',
    metric: 'FACE_SCORE',
    threshold: 0.85,
    unit: 'score',
  }, { id: 'rule-face' });
  insert(OT.AttendanceRule, {
    name: '连续缺卡天数',
    solution: 'solution-default',
    metric: 'CONSECUTIVE_MISSED',
    threshold: 3,
    unit: 'days',
  }, { id: 'rule-missed' });
}

// -------------------- 考勤打卡 --------------------
function seedAttendances() {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const validResidents = findAll(OT.Resident).filter((r) => r.status === 'ACTIVATED');
  for (const resident of validResidents) {
    for (let d = 0; d < 30; d++) {
      const ts = new Date(now - d * dayMs);
      const hour = 8 + (d % 4);
      ts.setHours(hour, (d * 7) % 60, 0, 0);
      const deadline = new Date(ts);
      deadline.setHours(20, 0, 0, 0);

      const roll = (Number(resident.id.replace(/[^0-9]/g, '')) + d) % 10;
      const status =
        roll === 0
          ? 'INVALID'
          : roll === 1
            ? 'MISSED'
            : roll === 2
              ? 'EXEMPTED'
              : 'VALID';

      insert(OT.Attendance, {
        resident: resident.id,
        attendanceType: d % 5 === 0 ? 'EMPLOYMENT' : 'RESIDENCE',
        checkIn: ts.toISOString(),
        deadline: deadline.toISOString(),
        mode: ['MINI_PROGRAM', 'KIOSK'][d % 2],
        status,
        location: {
          longitude: 113.27 + (d % 10) * 0.001 + (roll === 0 ? 0.05 : 0),
          latitude: 23.13 + (d % 10) * 0.001,
        },
        deviceId: `device-${(d % 5) + 1}`,
        ipAddress: `10.0.${d % 255}.${(d * 7) % 255}`,
      });
    }
  }
}

// -------------------- 请假 --------------------
function seedLeaveTypes() {
  ['事假', '病假', '外出', '公差', '设备故障', '其他'].forEach((name, i) =>
    insert(OT.LeaveType, {
      name,
      code: ['CASUAL', 'SICK', 'OUT', 'BUSINESS', 'DEVICE', 'OTHER'][i],
      maxDays: [3, 30, 7, 10, 5, 7][i],
      enable: true,
    }, { id: `leave-type-${i + 1}` }),
  );
}

function seedLeaves() {
  for (let i = 0; i < 12; i++) {
    const start = new Date(Date.now() - (i * 5 + 2) * 24 * 60 * 60 * 1000);
    const end = new Date(start);
    end.setDate(end.getDate() + 1 + (i % 3));
    const status = i < 4 ? 'UNDER_APPROVAL' : i < 9 ? 'COMPLETED' : 'CANCELLED';
    insert(OT.Leave, {
      resident: `resident-${i + 1}`,
      leaveType: `leave-type-${(i % 6) + 1}`,
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      reason: ['探亲', '就医', '出差', '家中突发情况', '设备维修'][i % 5],
      status,
      verifyState: status === 'UNDER_APPROVAL' ? 10 : status === 'COMPLETED' ? 30 : 90,
      submittedAt: start.toISOString(),
      submittedBy: `resident-${i + 1}`,
    }, { id: `leave-${i + 1}` });
  }
}

// -------------------- 备案(外出务工) --------------------
function seedMigrantWorks() {
  for (let i = 0; i < 8; i++) {
    const start = new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000);
    const end = new Date(start);
    end.setDate(end.getDate() + 90);
    const status = i < 3 ? 'UNDER_APPROVAL' : i < 6 ? 'COMPLETED' : 'CANCELLED';
    insert(OT.MigrantWork, {
      resident: `resident-${i + 5}`,
      type: ['EXTERNAL_WORK', 'TEMPORARY_OUT', 'LONG_TERM_REMOTE'][i % 3],
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      reason: '外出打工',
      destAddress: {
        region: 'BY',
        detail: `${['深圳市', '东莞市', '佛山市', '中山市'][i % 4]}劳务工业园${i + 1}号`,
        geoPoint: { longitude: 113.5 + i * 0.1, latitude: 22.6 + i * 0.05 },
      },
      employerName: `${['鸿海', '富士', '比亚迪', '美的'][i % 4]}电子`,
      status,
      verifyState: status === 'UNDER_APPROVAL' ? 10 : status === 'COMPLETED' ? 30 : 90,
      submittedAt: start.toISOString(),
      submittedBy: `resident-${i + 5}`,
    }, { id: `migrant-${i + 1}` });
  }
}

// -------------------- 资格申请 --------------------
function seedEligibilityApplications() {
  for (let i = 0; i < 15; i++) {
    const status = i < 4 ? 'DRAFT' : i < 9 ? 'UNDER_APPROVAL' : i < 13 ? 'COMPLETED' : 'CANCELLED';
    insert(OT.EligibilityApplication, {
      household: `household-${(i % 20) + 1}`,
      applicant: `resident-${i + 1}`,
      applicationType: ['INITIAL', 'REACTIVATION', 'ANNUAL_REVIEW'][i % 3],
      status,
      verifyState: status === 'DRAFT' ? 0 : status === 'UNDER_APPROVAL' ? 10 : status === 'COMPLETED' ? 30 : 90,
      submittedAt: status !== 'DRAFT' ? new Date(Date.now() - i * 86400000).toISOString() : undefined,
      submittedBy: status !== 'DRAFT' ? `resident-${i + 1}` : undefined,
      materials: [
        { type: 'ID_CARD', url: 'https://picsum.photos/seed/idc/300/200' },
        { type: 'INCOME_PROOF', url: 'https://picsum.photos/seed/inc/300/200' },
      ],
    }, { id: `eligibility-${i + 1}` });
  }
}

function seedHousingAllocations() {
  for (let i = 0; i < 12; i++) {
    insert(OT.HousingAllocation, {
      household: `household-${i + 1}`,
      housingNo: `广州保障花园 ${(i % 5) + 1}号楼-${i + 101}`,
      area: 50 + (i % 5) * 10,
      rentAmount: 800 + (i % 5) * 100,
      effectiveFrom: '2025-06-01',
      status: i < 8 ? 'ALLOC_ACTIVE' : i < 10 ? 'ALLOC_TERMINATED' : 'ALLOC_EXPIRED',
    });
  }
}

function seedRentalSubsidies() {
  for (let i = 0; i < 10; i++) {
    insert(OT.RentalSubsidy, {
      household: `household-${i + 1}`,
      monthlyAmount: 600 + (i % 5) * 100,
      effectiveFrom: '2025-06-01',
      status: i < 7 ? 'SUBSIDY_ACTIVE' : i < 9 ? 'SUBSIDY_SUSPENDED' : 'SUBSIDY_EXPIRED',
    });
  }
}

function seedAttendanceMakeups() {
  for (let i = 0; i < 5; i++) {
    insert(OT.AttendanceMakeup, {
      resident: `resident-${i + 1}`,
      missedDate: new Date(Date.now() - (i + 1) * 86400000).toISOString().slice(0, 10),
      reason: ['设备故障', '网络异常', '系统维护', '人脸采集失败', '其他'][i],
      status: i < 3 ? 'UNDER_APPROVAL' : 'COMPLETED',
      verifyState: i < 3 ? 10 : 30,
      submittedAt: new Date().toISOString(),
      submittedBy: `resident-${i + 1}`,
    });
  }
}

function seedChanges() {
  // 居住地址变更/就业变更/家庭成员变更/资格终止 各 3 条
  for (let i = 0; i < 3; i++) {
    insert(OT.ResidenceChange, {
      resident: `resident-${i + 1}`,
      effectiveFrom: '2026-04-01',
      reason: '搬迁',
      status: 'COMPLETED',
      verifyState: 30,
      submittedAt: '2026-03-15T10:00:00.000Z',
    });
    insert(OT.EmploymentChange, {
      resident: `resident-${i + 4}`,
      reason: '换工作',
      status: 'UNDER_APPROVAL',
      verifyState: 10,
      submittedAt: '2026-04-01T10:00:00.000Z',
    });
    insert(OT.HouseholdMemberChange, {
      household: `household-${i + 1}`,
      changeType: i % 2 === 0 ? 'ADD_MEMBER' : 'REMOVE_MEMBER',
      reason: i % 2 === 0 ? '新生儿' : '成员搬出',
      status: 'COMPLETED',
      verifyState: 30,
      submittedAt: '2026-02-01T10:00:00.000Z',
    });
    insert(OT.EligibilityTermination, {
      household: `household-${15 + i}`,
      reason: ['VOLUNTARY', 'INCOME_EXCEED', 'HOUSING_ACQUIRED'][i],
      effectiveDate: '2026-04-15',
      status: 'COMPLETED',
      verifyState: 30,
      submittedAt: '2026-04-10T10:00:00.000Z',
    });
  }
}

// -------------------- Fact 派生 --------------------
function seedFacts() {
  // AttendanceFact:遍历所有 Attendance 派生
  const attendances = findAll(OT.Attendance);
  for (const att of attendances) {
    const resident = table(OT.Resident).get(String(att.resident));
    if (!resident) continue;
    const timeliness =
      att.status === 'VALID'
        ? 'ON_TIME'
        : att.status === 'MISSED'
          ? 'MISSED'
          : att.status === 'EXEMPTED'
            ? 'EXEMPTED'
            : att.status === 'INVALID'
              ? 'LATE'
              : 'PENDING';
    insert(OT.AttendanceFact, {
      attendance: att.id,
      resident: att.resident,
      attendanceType: att.attendanceType,
      attendanceMode: att.mode,
      attendanceStatus: att.status,
      checkIn: att.checkIn,
      deadline: att.deadline,
      attendanceTimeliness: timeliness,
      attendanceCount: 1,
      requiredAttendanceCount: 1,
      validAttendanceCount: att.status === 'VALID' ? 1 : 0,
      invalidAttendanceCount: att.status === 'INVALID' ? 1 : 0,
      missedAttendanceCount: att.status === 'MISSED' ? 1 : 0,
      exemptedAttendanceCount: att.status === 'EXEMPTED' ? 1 : 0,
      pendingAttendanceCount: att.status === 'PENDING' ? 1 : 0,
      makeupAttendanceCount: att.mode === 'MAKEUP' ? 1 : 0,
    });
  }

  // 其他 Fact:按报表维度别名投影(让 mock 下按维度搜索也能命中)
  // 真实后端由 SEMANTIC_MODEL 的 expression/field 计算,这里手工对齐报表用到的维度。
  const reg = (addr: any) => (addr && typeof addr === 'object' ? addr.region : undefined);

  projectFact(OT.Leave, OT.LeaveFact, (r) => ({
    leave: r.id,
    leaveStatus: r.status,
  }));
  projectFact(OT.MigrantWork, OT.MigrantWorkFact, (r) => ({
    migrantWork: r.id,
    migrantWorkStatus: r.status,
    residentAddressRegion: reg(r.residentAddress ?? r.destAddress),
    companyAddressRegion: reg(r.companyAddress),
  }));
  projectFact(OT.EligibilityApplication, OT.EligibilityApplicationFact, (r) => ({
    application: r.id,
    applicationStatus: r.status,
  }));
  projectFact(OT.EligibilityTermination, OT.EligibilityTerminationFact, (r) => ({
    termination: r.id,
    terminationStatus: r.status,
    terminationType: r.terminationType ?? r.reason,
  }));
  projectFact(OT.HouseholdMemberChange, OT.HouseholdMemberChangeFact, (r) => {
    const m = r.member ? findById(OT.HouseholdMember, String(r.member)) : undefined;
    return {
      memberChange: r.id,
      changeStatus: r.status,
      memberRelationship: m?.relationship,
      memberIncluded: m?.isIncluded,
    };
  });
  projectFact(OT.ResidenceChange, OT.ResidenceChangeFact, (r) => ({
    residenceChange: r.id,
    changeStatus: r.status,
    residenceRegion: reg(r.address),
  }));
  projectFact(OT.EmploymentChange, OT.EmploymentChangeFact, (r) => ({
    employmentChange: r.id,
    changeStatus: r.status,
    employmentRegion: reg(r.companyAddress),
  }));
  projectFact(OT.HousingAllocation, OT.HousingAllocationFact, (r) => ({
    allocation: r.id,
    allocationStatus: r.status,
  }));
  projectFact(OT.RentalSubsidy, OT.RentalSubsidyFact, (r) => ({
    subsidy: r.id,
    subsidyStatus: r.status,
  }));
  projectFact(OT.PersonalIncome, OT.PersonalIncomeFact, (r) => ({
    income: r.id,
    recordStatus: r.status ?? 'RECORD_ACTIVE',
    period: r.period ?? r.reportPeriod,
  }));
  projectFact(OT.AttendanceMakeup, OT.AttendanceMakeupFact, (r) => {
    const ta = r.targetAttendance ? findById(OT.Attendance, String(r.targetAttendance)) : undefined;
    return {
      makeup: r.id,
      makeupStatus: r.status,
      targetAttendanceType: ta?.attendanceType,
      targetAttendanceStatus: ta?.status,
    };
  });

  // Snapshot Fact:按维度别名投影
  projectFact(OT.Resident, OT.ResidentSnapshotFact, (r) => ({
    resident: r.id,
    residentStatus: r.status,
    ageGroup: ageGroupOf(r.birthDate),
  }));
  seedHouseholdSnapshotFact();
  projectFact(OT.HouseholdMember, OT.HouseholdMemberSnapshotFact, (r) => {
    const h = r.household ? findById(OT.Household, String(r.household)) : undefined;
    const res = r.resident ? findById(OT.Resident, String(r.resident)) : undefined;
    return {
      member: r.id,
      relationship: r.relation ?? r.relationship,
      included: r.isIncluded ?? true,
      householdGuaranteeType: h?.guaranteeType,
      householdStatus: h?.status,
      residentStatus: res?.status,
    };
  });
  projectFact(OT.Residence, OT.ResidenceSnapshotFact, (r) => ({
    residence: r.id,
    residenceType: r.addressType,
    residenceRegion: reg(r.address),
    monitoringTarget: r.isMonitoringTarget,
    recordStatus: r.status,
  }));
  projectFact(OT.Employment, OT.EmploymentSnapshotFact, (r) => ({
    employment: r.id,
    employmentAddressType: r.addressType,
    employmentRegion: reg(r.workAddress),
    monitoringTarget: r.isMonitoringTarget,
    recordStatus: r.recordStatus ?? r.status,
  }));
}

/** 年龄分层(与 XML expression 对齐) */
function ageGroupOf(birthDate?: string): string {
  if (!birthDate) return 'UNKNOWN';
  const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
  if (age < 30) return 'UNDER_30';
  if (age < 45) return 'AGE_30_44';
  if (age < 60) return 'AGE_45_59';
  return 'AGE_60_PLUS';
}

/** 裸镜像源实体 + 叠加报表维度别名 */
function projectFact(
  srcType: string,
  factType: string,
  aliasFn: (row: Record<string, any>) => Record<string, any>,
) {
  for (const row of findAll(srcType)) {
    insert(factType, { ...row, sourceId: row.id, ...aliasFn(row) });
  }
}

/**
 * 家庭快照事实:投影出报表维度别名(householdStatus / applicantGender 等),
 * 使 mock 下按这些维度搜索也能命中。
 * 真实后端由 SEMANTIC_MODEL 的 expression/field 计算,这里手工对齐。
 */
function seedHouseholdSnapshotFact() {
  const sizeBand = (n: number) =>
    n <= 1 ? 'SINGLE_PERSON' : n === 2 ? 'TWO_PERSON' : n === 3 ? 'THREE_PERSON' : 'FOUR_PLUS_PERSON';
  for (const h of findAll(OT.Household)) {
    const applicant = h.applicant ? findById(OT.Resident, String(h.applicant)) : undefined;
    insert(OT.HouseholdSnapshotFact, {
      ...h,
      sourceId: h.id,
      household: h.id,
      householdStatus: h.status, // XML: field="status"
      householdSizeBand: sizeBand(Number(h.householdSize) || 0),
      applicantGender: applicant?.gender,
      applicantMaritalStatus: applicant?.maritalStatus,
      applicantResidentStatus: applicant?.status,
      createdAt: h.createAt,
    });
  }
}

// -------------------- 通知消息(B 轨:真实 Notification 实体) --------------------
function seedNotifications() {
  const TYPES = [
    'CHECKIN_REMINDER',
    'MAKEUP_REMINDER',
    'ALERT',
    'APPROVAL_RESULT',
    'EXPIRY_REMINDER',
  ];
  const TITLES = ['打卡提醒', '补卡提醒', '预警通知', '审批结果通知', '到期提醒'];
  for (let i = 0; i < 15; i++) {
    const t = i % 5;
    const isAlert = t === 2;
    insert(
      OT.Notification,
      {
        recipientUser: 'user-approver',
        notificationType: TYPES[t],
        channel: 'IN_APP',
        title: TITLES[t],
        content: `第 ${i + 1} 条系统通知 — ${TITLES[t]}`,
        status: i > 5 ? 'READ' : 'UNREAD',
        readAt: i > 5 ? new Date(Date.now() - i * 1700000).toISOString() : undefined,
        sentAt: new Date(Date.now() - i * 1800000).toISOString(),
        // 预警类通知:轻量处置标记直接挂在通知上(预警不单独建实体)
        handled: isAlert ? i % 4 === 0 : undefined,
        handledAt: isAlert && i % 4 === 0 ? new Date().toISOString() : undefined,
        handledBy: isAlert && i % 4 === 0 ? 'user-approver' : undefined,
        // 预警来源指向 AttendanceFact 派生(无独立 Alert 实体)
        bizType: isAlert ? OT.AttendanceFact : undefined,
      },
      { id: `notification-${i + 1}` },
    );
  }
}

// -------------------- 系统配置(B 轨:SysConfig KV) --------------------
function seedSysConfig() {
  // key 与 System/Config.tsx 表单字段一一对应;值统一存字符串
  const defaults: Array<[string, string, string, string]> = [
    // [configKey, configValue, valueType, category]
    ['attendanceMissThreshold', '3', 'NUMBER', 'attendance'],
    ['geoDistanceWarn', '100', 'NUMBER', 'geo'],
    ['geoDistanceAlert', '300', 'NUMBER', 'geo'],
    ['geoAccuracyThreshold', '50', 'NUMBER', 'geo'],
    ['faceScoreThreshold', '0.85', 'NUMBER', 'face'],
    ['faceMatchRetry', '3', 'NUMBER', 'face'],
    ['smsEnabled', 'true', 'BOOLEAN', 'notify'],
    ['inappEnabled', 'true', 'BOOLEAN', 'notify'],
    ['emailEnabled', 'false', 'BOOLEAN', 'notify'],
    ['leaveDurationMin', '1', 'NUMBER', 'leave'],
    ['leaveDurationMax', '14', 'NUMBER', 'leave'],
    ['leaveMonthMax', '5', 'NUMBER', 'leave'],
    ['leaveApplyLeadtime', '24', 'NUMBER', 'leave'],
    ['filingGeofenceRadius', '200', 'NUMBER', 'filing'],
    ['filingLocationAccuracy', '50', 'NUMBER', 'filing'],
    ['filingDurationMin', '1', 'NUMBER', 'filing'],
    ['filingDurationMax', '180', 'NUMBER', 'filing'],
    ['filingApplyLeadtime', '48', 'NUMBER', 'filing'],
    ['systemName', '公租房监测系统', 'STRING', 'system'],
    ['systemSubtitle', '审批端管理平台', 'STRING', 'system'],
    ['maxUploadSize', '10', 'NUMBER', 'system'],
    ['dataRetentionDays', '1095', 'NUMBER', 'system'],
    ['attendanceWindowStart', '06:00', 'STRING', 'attendance'],
    ['attendanceWindowEnd', '22:00', 'STRING', 'attendance'],
  ];
  defaults.forEach(([configKey, configValue, valueType, category], i) =>
    insert(
      OT.SysConfig,
      { configKey, configValue, valueType, category },
      { id: `sysconfig-${i + 1}` },
    ),
  );
}

// -------------------- 保存的筛选器(B 轨:SavedFilter) --------------------
function seedSavedFilters() {
  const list: Array<Partial<Record<string, any>>> = [
    { name: '高风险房屋筛选', description: '筛选面积大于100平米且入住时间超过5年的房屋', fieldCount: 3, status: 'active', createdAt: '2024-01-15 10:30:00', updatedAt: '2024-01-20 14:20:00', jsonLogic: null },
    { name: '待审核申请筛选', description: '筛选状态为待审核且提交时间在30天内的申请', fieldCount: 2, status: 'active', createdAt: '2024-01-10 09:00:00', updatedAt: '2024-01-18 16:45:00', jsonLogic: null },
    { name: '异常数据筛选', description: '筛选入住人数异常或面积数据异常的记录', fieldCount: 4, status: 'inactive', createdAt: '2024-01-05 11:20:00', updatedAt: '2024-01-12 10:30:00', jsonLogic: null },
  ];
  list.forEach((f, i) => insert(OT.SavedFilter, f, { id: `filter-${i + 1}` }));
}

// -------------------- 审批流程定义(B 轨:ApprovalFlow) --------------------
function seedApprovalFlows() {
  // 流程元数据;graph(LogicFlow 图)由页面的默认模板提供,后端补实体后随流程存储
  const flows: Array<Partial<Record<string, any>>> = [
    { flowKey: 'material', name: '材料审批流程', version: 'v1.2', status: '已启用', creatorName: '管理员', createTime: '2024-01-15', description: '保障户材料提交审批流程,包括材料提交、初审、复审、终审等环节' },
    { flowKey: 'leave', name: '请假审批流程', version: 'v1.0', status: '已启用', creatorName: '管理员', createTime: '2024-01-20', description: '保障户请假申请审批流程,包括申请提交、主管审批、备案等环节' },
    { flowKey: 'filing', name: '备案审批流程', version: 'v1.1', status: '已启用', creatorName: '管理员', createTime: '2024-02-01', description: '保障户外出备案审批流程,包括备案申请、审核、批准等环节' },
  ];
  flows.forEach((f, i) => insert(OT.ApprovalFlow, f, { id: `flow-${i + 1}` }));
}

// -------------------- 审批记录(B 轨:多级审批流程时间线) --------------------
function seedApprovalRecords() {
  // 各审批单据的多级步骤模板(还原截图那种逐级链条)
  const stepTemplates: Record<string, Array<[string, string]>> = {
    // [stepName, approverName]
    [OT.EligibilityApplication]: [
      ['发起人(提交)', '田鹏'],
      ['逐级领导审批', '刘振伟'],
      ['资格初审', '裴晨宇'],
      ['资格复核', '刘倡利'],
      ['主管审批', '赵艳'],
      ['结束', ''],
    ],
    [OT.Leave]: [
      ['发起人(提交)', '田鹏'],
      ['直属主管审批', '刘振伟'],
      ['人事审核', '裴晨宇'],
      ['结束', ''],
    ],
    [OT.MigrantWork]: [
      ['发起人(提交)', '田鹏'],
      ['社区初审', '刘振伟'],
      ['街道复核', '赵艳'],
      ['结束', ''],
    ],
    [OT.AttendanceMakeup]: [
      ['发起人(提交)', '田鹏'],
      ['考勤主管审批', '刘振伟'],
      ['结束', ''],
    ],
    [OT.EligibilityTermination]: [
      ['发起人(提交)', '田鹏'],
      ['资格审核', '裴晨宇'],
      ['主管审批', '赵艳'],
      ['结束', ''],
    ],
    [OT.HouseholdMemberChange]: [
      ['发起人(提交)', '田鹏'],
      ['社区审核', '刘振伟'],
      ['结束', ''],
    ],
    [OT.ResidenceChange]: [
      ['发起人(提交)', '田鹏'],
      ['社区审核', '刘振伟'],
      ['结束', ''],
    ],
    [OT.EmploymentChange]: [
      ['发起人(提交)', '田鹏'],
      ['社区审核', '刘振伟'],
      ['结束', ''],
    ],
  };

  let seq = 0;
  const baseTime = Date.now() - 3 * 86400000;

  for (const [objectType, steps] of Object.entries(stepTemplates)) {
    for (const doc of findAll(objectType)) {
      // 已完成→全通过;审批中→前几步通过+当前待审+后续未创建;草稿/取消→不生成
      const status = doc.status;
      if (status !== 'COMPLETED' && status !== 'UNDER_APPROVAL') continue;
      // 审批中的:通过到中间某步;完成的:全部通过(最后"结束"步也通过)
      const passUntil =
        status === 'COMPLETED' ? steps.length : Math.max(2, Math.floor(steps.length / 2));

      steps.forEach(([stepName, approverName], idx) => {
        let result: string;
        let approvalTime: string | undefined;
        let opinion: string | undefined;
        if (idx === 0) {
          // 发起人步永远是"提交"
          result = 'PASS';
          approvalTime = new Date(baseTime).toISOString();
          opinion = `${approverName}发起申请`;
        } else if (idx < passUntil) {
          result = 'PASS';
          approvalTime = new Date(baseTime + idx * 3600000).toISOString();
          opinion = '通过';
        } else if (idx === passUntil && status === 'UNDER_APPROVAL') {
          result = 'PENDING';
        } else {
          result = 'NOT_CREATED';
        }
        seq += 1;
        insert(
          OT.ApprovalRecord,
          {
            bizType: objectType,
            bizRef: doc.id,
            ordinal: idx + 1,
            stepName,
            approverName: approverName || undefined,
            approvalTime,
            opinion,
            result,
          },
          { id: `apprec-${seq}` },
        );
      });
    }
  }
}

// -------------------- 系统配置(给 System 模块用) --------------------
function seedSystem() {
  // 不属于本体,但页面要用,这里塞到一些自定义 objectType:
  insert('cn.byteawake.prh.SystemConfig', {
    key: 'attendance.timeWindow',
    value: '08:00-20:00',
    description: '打卡时段',
  }, { id: 'cfg-attendance-time' });
  insert('cn.byteawake.prh.SystemConfig', {
    key: 'alert.locationDeviationMeters',
    value: '200',
    description: '位置偏离阈值(米)',
  }, { id: 'cfg-location' });
  insert('cn.byteawake.prh.SystemConfig', {
    key: 'alert.faceMinScore',
    value: '0.85',
    description: '人脸匹配最低分',
  }, { id: 'cfg-face' });

  // 操作日志
  for (let i = 0; i < 30; i++) {
    insert('cn.byteawake.prh.OperationLog', {
      operator: ['admin', 'approver', 'staff'][i % 3],
      action: ['login', 'create', 'update', 'delete', 'approve'][i % 5],
      target: `resident-${i + 1}`,
      ipAddress: `192.168.1.${i + 1}`,
      operatedAt: new Date(Date.now() - i * 3600000).toISOString(),
    });
  }

  // 站内消息
  for (let i = 0; i < 15; i++) {
    insert('cn.byteawake.prh.Message', {
      title: ['打卡提醒', '审批通过', '预警通知', '请假到期', '系统维护'][i % 5],
      content: `第 ${i + 1} 条系统消息`,
      level: ['info', 'success', 'warning', 'error'][i % 4],
      read: i > 5,
      to: 'user-approver',
      createAt: new Date(Date.now() - i * 1800000).toISOString(),
    });
  }

  // 角色(B 轨 OT.Role,字段对齐 System/Role 页面)
  const roles: Array<Partial<Record<string, any>>> = [
    { name: '系统管理员', code: 'admin', description: '系统最高权限,可管理所有功能', userCount: 3, permissions: ['dashboard', 'monitor', 'approval', 'report', 'system'], status: 'active', createTime: '2025-01-01 00:00:00' },
    { name: '审批员', code: 'approver', description: '负责审批材料、请假、备案等申请', userCount: 15, permissions: ['dashboard', 'approval', 'report'], status: 'active', createTime: '2025-01-01 00:00:00' },
    { name: '监测员', code: 'monitor', description: '负责打卡核验、预警处置', userCount: 8, permissions: ['dashboard', 'monitor', 'report'], status: 'active', createTime: '2025-01-01 00:00:00' },
    { name: '只读用户', code: 'viewer', description: '只能查看数据,无操作权限', userCount: 5, permissions: ['dashboard', 'report'], status: 'active', createTime: '2025-02-15 10:00:00' },
  ];
  roles.forEach((r, i) => insert(OT.Role, r, { id: `role-${i + 1}` }));

  // 菜单(B 轨 OT.Menu,字段对齐 System/Menu 页面)
  const menus: Array<Partial<Record<string, any>>> = [
    { name: '工作台', path: '/dashboard', icon: 'dashboard', sort: 1, type: 'menu', visible: true, status: 'active' },
    { name: '监测与处置', path: '/monitor', icon: 'monitor', sort: 2, type: 'menu', visible: true, status: 'active' },
    { name: '打卡核验', path: '/monitor/attendance', icon: 'check-circle', parentId: 'menu-2', sort: 1, type: 'menu', permission: 'monitor:attendance', visible: true, status: 'active' },
    { name: '预警处置', path: '/monitor/alert', icon: 'warning', parentId: 'menu-2', sort: 2, type: 'menu', permission: 'monitor:alert', visible: true, status: 'active' },
    { name: '申请与审批', path: '/approval', icon: 'file-text', sort: 3, type: 'menu', visible: true, status: 'active' },
    { name: '材料审批', path: '/approval/material', icon: 'file-image', parentId: 'menu-5', sort: 1, type: 'menu', permission: 'approval:material', visible: true, status: 'active' },
    { name: '请假管理', path: '/monitor/leaves', icon: 'calendar', parentId: 'menu-5', sort: 2, type: 'menu', permission: 'approval:leave', visible: true, status: 'active' },
    { name: '备案管理', path: '/monitor/migrant-works', icon: 'environment', parentId: 'menu-5', sort: 3, type: 'menu', permission: 'approval:filing', visible: true, status: 'active' },
    { name: '分析与报表', path: '/report', icon: 'bar-chart', sort: 4, type: 'menu', visible: true, status: 'active' },
    { name: '系统与运维', path: '/system', icon: 'setting', sort: 5, type: 'menu', visible: true, status: 'active' },
    { name: '人员管理', path: '/system/personnel', icon: 'team', parentId: 'menu-10', sort: 1, type: 'menu', permission: 'system:personnel', visible: true, status: 'active' },
    { name: '角色管理', path: '/system/role', icon: 'user', parentId: 'menu-10', sort: 2, type: 'menu', permission: 'system:role', visible: true, status: 'active' },
  ];
  menus.forEach((m, i) => insert(OT.Menu, m, { id: `menu-${i + 1}` }));
}

// -------------------- 工具(供 handler 用) --------------------
export { applyQuery };

// -------------------- 电子围栏种子 --------------------
function seedFences() {
  // 圆形围栏:广州天河区中心,半径 500 米
  insert(OT.Fence, {
    name: '天河中心-圆形围栏',
    fenceType: 'CIRCLE',
    center: { longitude: 113.3245, latitude: 23.1357 },
    radius: 500,
  }, { id: 'fence-circle-1' });

  // 多边形围栏:越秀区某街区
  insert(OT.Fence, {
    name: '越秀区-多边形围栏',
    fenceType: 'POLYGON',
  }, { id: 'fence-polygon-1' });
  const vertices = [
    { longitude: 113.2622, latitude: 23.1291 },
    { longitude: 113.2701, latitude: 23.1296 },
    { longitude: 113.2715, latitude: 23.1235 },
    { longitude: 113.2638, latitude: 23.1228 },
  ];
  vertices.forEach((p, i) =>
    insert(OT.FenceVertex, {
      fence: 'fence-polygon-1',
      ordinal: i,
      point: p,
    }),
  );
}
