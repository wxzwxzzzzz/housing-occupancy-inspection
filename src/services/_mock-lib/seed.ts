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
import { insert, table, findAll, applyQuery } from './store';

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
      residenceType: ['SUBSIDIZED_HOUSING', 'MARKET_RENTAL', 'SELF_OWNED'][i % 3],
      address: {
        region: REGION_CODES[i % REGION_CODES.length],
        detail: `广州市${['天河区', '越秀区', '海珠区', '白云区'][i % 4]}保障花园${i + 1}号楼${(i % 6) + 1}单元${(i % 9) + 1}0${(i % 8) + 2}`,
        geoPoint: { longitude: 113.27 + (i % 10) * 0.01, latitude: 23.13 + (i % 10) * 0.005 },
      },
      effectiveFrom: '2025-01-01',
      recordStatus: 'RECORD_ACTIVE',
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

  // 其他 Fact 直接镜像对应实体(满足报表 list 调用即可)
  copyAsFact(OT.Leave, OT.LeaveFact);
  copyAsFact(OT.MigrantWork, OT.MigrantWorkFact);
  copyAsFact(OT.EligibilityApplication, OT.EligibilityApplicationFact);
  copyAsFact(OT.EligibilityTermination, OT.EligibilityTerminationFact);
  copyAsFact(OT.HouseholdMemberChange, OT.HouseholdMemberChangeFact);
  copyAsFact(OT.ResidenceChange, OT.ResidenceChangeFact);
  copyAsFact(OT.EmploymentChange, OT.EmploymentChangeFact);
  copyAsFact(OT.HousingAllocation, OT.HousingAllocationFact);
  copyAsFact(OT.RentalSubsidy, OT.RentalSubsidyFact);
  copyAsFact(OT.PersonalIncome, OT.PersonalIncomeFact);
  copyAsFact(OT.AttendanceMakeup, OT.AttendanceMakeupFact);

  // Snapshot Fact:取一份当前实体
  copyAsFact(OT.Resident, OT.ResidentSnapshotFact);
  copyAsFact(OT.Household, OT.HouseholdSnapshotFact);
  copyAsFact(OT.HouseholdMember, OT.HouseholdMemberSnapshotFact);
  copyAsFact(OT.Residence, OT.ResidenceSnapshotFact);
  copyAsFact(OT.Employment, OT.EmploymentSnapshotFact);
}

function copyAsFact(srcType: string, factType: string) {
  for (const row of findAll(srcType)) {
    insert(factType, { ...row, sourceId: row.id });
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

  // 角色 / 菜单(本体未覆盖,前端自管)
  ['超级管理员', '审批员', '工作人员', '保障户'].forEach((name, i) =>
    insert('cn.byteawake.prh.Role', {
      name,
      code: ['ADMIN', 'APPROVER', 'STAFF', 'RESIDENT'][i],
      description: `${name}角色`,
      permissions: [],
      enable: true,
    }, { id: `role-${i + 1}` }),
  );
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
