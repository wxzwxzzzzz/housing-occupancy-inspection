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

/**
 * 审批后置联动(对应本体 XML 的 <post> 规则)。
 * 让数据真正流转:跨实体状态联动 + 生成站内通知。
 * 换真实后端后由后端做,前端 mock 这里模拟以便 demo 看到真流转。
 */
function runApprovalPostEffect(
  objectType: string,
  row: Record<string, any>,
  result: 'APPROVED' | 'REJECTED',
) {
  // 通用:生成一条审批结果通知(预警/通知系统联动)
  const recipient = row.resident ?? row.applicant;
  insert(OT.Notification, {
    recipient: typeof recipient === 'string' ? recipient : undefined,
    notificationType: 'APPROVAL_RESULT',
    channel: 'IN_APP',
    title: result === 'APPROVED' ? '审批通过通知' : '审批驳回通知',
    content: `您的申请(${simpleNameOf(objectType)})已${result === 'APPROVED' ? '审批通过' : '被驳回'}`,
    status: 'UNREAD',
    sentAt: new Date().toISOString(),
    bizType: objectType,
    bizRef: row.id,
  });

  if (result !== 'APPROVED') return;

  // 资质申请通过 → 家庭进入候选(才能配租/补贴),对应本体准入流转
  if (objectType === OT.EligibilityApplication && row.household) {
    update(OT.Household, String(row.household), { status: 'CANDIDATE' });
  }

  // 资格终止通过 → 家庭归档退出
  if (objectType === OT.EligibilityTermination && row.household) {
    update(OT.Household, String(row.household), {
      status: 'ARCHIVED',
      archiveDate: new Date().toISOString().slice(0, 10),
    });
  }

  // 居住/工作地址变更通过 → 落地到对应明细(标记变更生效)
  if (objectType === OT.ResidenceChange && row.resident) {
    // 仅 demo:把该居民最新一条居住记录标记 effectiveDate=now
    const residences = findAll(OT.Residence).filter((r) => r.resident === row.resident);
    const latest = residences[residences.length - 1];
    if (latest) update(OT.Residence, latest.id, { effectiveDate: new Date().toISOString().slice(0, 10) });
  }
}

function simpleNameOf(objectType: string): string {
  const map: Record<string, string> = {
    [OT.EligibilityApplication]: '资质申请',
    [OT.EligibilityTermination]: '资格终止',
    [OT.Leave]: '请假',
    [OT.AttendanceMakeup]: '补卡',
    [OT.MigrantWork]: '备案/外出务工',
    [OT.ResidenceChange]: '居住地址变更',
    [OT.EmploymentChange]: '工作地址变更',
    [OT.HouseholdMemberChange]: '家庭成员变更',
  };
  return map[objectType] ?? '申请';
}

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
    if (!row) return notFound();
    runApprovalPostEffect(objectType, row, 'APPROVED');
    return successResponse({ data: [row] });
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
    if (!row) return notFound();
    runApprovalPostEffect(objectType, row, 'REJECTED');
    return successResponse({ data: [row] });
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
// Notification.markRead / markAllRead / process（B 轨：站内消息已读 + 预警轻量处置）
// =============================================================================
const notificationHandlers: Record<string, Handler> = {
  markRead({ payload, id }) {
    const targetId = id ?? payload?.id;
    if (!targetId) return failureResponse('MISSING_ID', '缺少 id');
    const row = update(OT.Notification, targetId, {
      status: 'READ',
      readAt: new Date().toISOString(),
    });
    return row ? successResponse({ data: [row] }) : notFound();
  },
  markAllRead() {
    const now = new Date().toISOString();
    const unread = findAll(OT.Notification).filter((n) => n.status === 'UNREAD');
    unread.forEach((n) => update(OT.Notification, n.id, { status: 'READ', readAt: now }));
    return successResponse({ data: unread.map((n) => ({ ...n, status: 'READ', readAt: now })) });
  },
  /** 预警类消息的轻量处置：标记已处置（预警不单独建实体，处置标记挂在通知上） */
  process({ payload, id }) {
    const targetId = id ?? payload?.id;
    if (!targetId) return failureResponse('MISSING_ID', '缺少 id');
    const row = update(OT.Notification, targetId, {
      handled: true,
      handledAt: new Date().toISOString(),
      handledBy: payload?.handledBy ?? 'user-approver',
      handleNote: payload?.handleNote ?? '',
      status: 'READ',
      readAt: new Date().toISOString(),
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
  [OT.Notification]: notificationHandlers,
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
