/**
 * 自定义 action 处理器(本体之外或语义特殊的 action)
 *
 * 默认 CRUD(list/detail/add/modify/delete/enable/stop/refer/querytree/submit/unsubmit/archive)
 * 由 ontology.ts 直接调 store 完成,这里只放有业务规则的 action。
 */

import { OT } from '../ontology/object-types';
import { findAll, findById, insert, table, update } from './store';

type HandlerCtx = {
  objectType: string;
  payload: Record<string, any>;
  id?: string;
};

type Handler = (ctx: HandlerCtx) => any;

// =============================================================================
// User.authenticate / signup / activate / lockAccount / unlockAccount
// =============================================================================
const userHandlers: Record<string, Handler> = {
  authenticate({ payload }) {
    const { account, phone, email, password, code } = payload;
    let user = findAll(OT.User).find(
      (u) =>
        (account && u.account === account) ||
        (phone && u.phone === phone) ||
        (email && u.email === email),
    );

    // 短信验证码登录:任意验证码都接受(mock)
    if (!user && phone) {
      user = findAll(OT.User).find((u) => u.phone === phone);
    }

    if (!user) {
      return failureResponse('USER_NOT_FOUND', '用户不存在', [
        { path: 'account', message: '账号不存在' },
      ]);
    }

    if (password !== undefined && user.password !== password) {
      return failureResponse('INVALID_CREDENTIALS', '账号或密码错误', [
        { path: 'password', message: '密码错误' },
      ]);
    }
    if (code !== undefined && !/^\d{4,6}$/.test(String(code))) {
      return failureResponse('INVALID_CODE', '验证码错误', [
        { path: 'code', message: '验证码不正确' },
      ]);
    }
    if (user.status !== 'ACTIVE') {
      return failureResponse('USER_DISABLED', '账号已停用');
    }

    update(OT.User, user.id, { lastSignInAt: new Date().toISOString() });
    const token = `mock-token-${user.id}-${Date.now()}`;
    const safeUser = { ...user };
    delete safeUser.password;
    return successResponse({ data: [{ ...safeUser, token, tenant: 'default' }] });
  },

  signup({ payload }) {
    const { account, phone, email, password, fullName } = payload;
    if (!account && !phone && !email) {
      return failureResponse('MISSING_IDENTIFIER', '账号/手机/邮箱至少一项');
    }
    const dup = findAll(OT.User).find(
      (u) => u.account === account || (phone && u.phone === phone),
    );
    if (dup) {
      return failureResponse('USER_EXISTS', '账号已存在', [
        { path: 'account', message: '该账号已被注册' },
      ]);
    }
    const row = insert(OT.User, {
      account: account ?? phone ?? email,
      phone,
      email,
      password: password ?? '123456',
      fullName: fullName ?? '新用户',
      status: 'ACTIVE',
      userType: 'STAFF',
      isAnonymous: false,
      isSSOUser: false,
      emailChangeStatus: 'NONE',
    });
    return successResponse({ data: [omitPassword(row)] });
  },

  activate({ id }) {
    if (!id) return failureResponse('MISSING_ID', '缺少 id');
    const row = update(OT.User, id, {
      status: 'ACTIVE',
      activateAt: new Date().toISOString(),
    });
    return row ? successResponse({ data: [omitPassword(row)] }) : notFound();
  },

  lockAccount({ id, payload }) {
    const targetId = id ?? payload?.id;
    if (!targetId) return failureResponse('MISSING_ID', '缺少 id');
    const row = update(OT.User, targetId, {
      status: 'LOCKED',
      lockedUntil: payload?.until ?? null,
    });
    return row ? successResponse({ data: [omitPassword(row)] }) : notFound();
  },

  unlockAccount({ id, payload }) {
    const targetId = id ?? payload?.id;
    if (!targetId) return failureResponse('MISSING_ID', '缺少 id');
    const row = update(OT.User, targetId, {
      status: 'ACTIVE',
      lockedUntil: null,
      failedLoginAttempts: 0,
    });
    return row ? successResponse({ data: [omitPassword(row)] }) : notFound();
  },

  detail_currentUser() {
    // 自定义动作:取当前用户(token 解析在 ontology.ts)
    return successResponse({ data: [] });
  },
};

// =============================================================================
// Attendance.checkin / verify / makeup
// =============================================================================
const attendanceHandlers: Record<string, Handler> = {
  checkin({ payload }) {
    const { resident, attendanceType, location, face } = payload;
    if (!resident) {
      return failureResponse('MISSING_RESIDENT', '缺少居民', [
        { path: 'resident', message: '请选择居民' },
      ]);
    }
    const now = new Date();
    const deadline = new Date(now);
    deadline.setHours(20, 0, 0, 0);
    const row = insert(OT.Attendance, {
      resident,
      attendanceType: attendanceType ?? 'RESIDENCE',
      checkIn: now.toISOString(),
      deadline: deadline.toISOString(),
      mode: 'MINI_PROGRAM',
      status: 'VALID',
      location,
      face,
    });
    insert(OT.AttendanceFact, {
      attendance: row.id,
      resident,
      attendanceType: row.attendanceType,
      attendanceMode: 'MINI_PROGRAM',
      attendanceStatus: 'VALID',
      checkIn: row.checkIn,
      deadline: row.deadline,
      attendanceTimeliness: 'ON_TIME',
      attendanceCount: 1,
      requiredAttendanceCount: 1,
      validAttendanceCount: 1,
      invalidAttendanceCount: 0,
      missedAttendanceCount: 0,
      exemptedAttendanceCount: 0,
      pendingAttendanceCount: 0,
      makeupAttendanceCount: 0,
    });
    return successResponse({ data: [row] });
  },
};

// =============================================================================
// Resident.verify / archive
// =============================================================================
const residentHandlers: Record<string, Handler> = {
  verify({ payload, id }) {
    const targetId = id ?? payload?.id;
    if (!targetId) return failureResponse('MISSING_ID', '缺少 id');
    const row = update(OT.Resident, targetId, {
      status: 'VERIFIED',
      facePhoto: payload?.facePhoto ?? findById(OT.Resident, targetId)?.facePhoto,
    });
    return row ? successResponse({ data: [row] }) : notFound();
  },
};

// =============================================================================
// 审批通用动作:approve / reject / withdraw / submit
// 适用所有混入 IApprovalFlow 的实体
// =============================================================================
const approvalHandlers: Record<string, Handler> = {
  approve({ objectType, payload, id }) {
    const targetId = id ?? payload?.id;
    if (!targetId) return failureResponse('MISSING_ID', '缺少 id');
    const row = update(objectType, targetId, {
      status: 'COMPLETED',
      verifyState: 30,
      approvalResult: 'APPROVED',
      approver: payload?.approver ?? 'user-approver',
      approvalTime: new Date().toISOString(),
      approvalOpinion: payload?.opinion ?? '',
    });
    return row ? successResponse({ data: [row] }) : notFound();
  },
  reject({ objectType, payload, id }) {
    const targetId = id ?? payload?.id;
    if (!targetId) return failureResponse('MISSING_ID', '缺少 id');
    const row = update(objectType, targetId, {
      status: 'CANCELLED',
      verifyState: 90,
      approvalResult: 'REJECTED',
      approver: payload?.approver ?? 'user-approver',
      approvalTime: new Date().toISOString(),
      approvalOpinion: payload?.opinion ?? '',
    });
    return row ? successResponse({ data: [row] }) : notFound();
  },
  withdraw({ objectType, payload, id }) {
    const targetId = id ?? payload?.id;
    if (!targetId) return failureResponse('MISSING_ID', '缺少 id');
    const row = update(objectType, targetId, {
      status: 'CANCELLED',
      verifyState: 0,
      withdrawnAt: new Date().toISOString(),
      withdrawnBy: payload?.by ?? 'system',
    });
    return row ? successResponse({ data: [row] }) : notFound();
  },
  submit({ objectType, payload, id }) {
    const targetId = id ?? payload?.id;
    if (!targetId) return failureResponse('MISSING_ID', '缺少 id');
    const row = update(objectType, targetId, {
      status: 'UNDER_APPROVAL',
      verifyState: 10,
      submittedAt: new Date().toISOString(),
      submittedBy: payload?.by ?? 'system',
    });
    return row ? successResponse({ data: [row] }) : notFound();
  },
};

// =============================================================================
// 路由表:objectType → action → handler
// =============================================================================
export const customHandlers: Record<string, Record<string, Handler>> = {
  [OT.User]: userHandlers,
  [OT.Attendance]: attendanceHandlers,
  [OT.Resident]: residentHandlers,
};

/** 全部含审批流的实体共享 approvalHandlers */
export const approvalEntities = new Set([
  OT.Leave,
  OT.MigrantWork,
  OT.EligibilityApplication,
  OT.EligibilityTermination,
  OT.AttendanceMakeup,
  OT.ResidenceChange,
  OT.EmploymentChange,
  OT.HouseholdMemberChange,
]);

export function getApprovalHandler(actionName: string): Handler | undefined {
  return approvalHandlers[actionName];
}

// =============================================================================
// 工具
// =============================================================================
export function successResponse<T>({ data, page }: { data: T[]; page?: any }) {
  return {
    success: true,
    code: 'OK',
    message: '操作成功',
    data,
    page,
  };
}

export function failureResponse(
  code: string,
  message: string,
  fieldErrors?: Array<{ path: string; message: string }>,
) {
  return {
    success: false,
    code,
    message,
    fieldErrors,
  };
}

function notFound() {
  return failureResponse('NOT_FOUND', '记录不存在');
}

function omitPassword(row: Record<string, any>) {
  const copy = { ...row };
  delete copy.password;
  return copy;
}

export { findAll, findById, insert, table, update };
