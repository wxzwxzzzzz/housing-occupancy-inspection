import { makeAutoObservable, runInAction } from 'mobx';
import { reportCards } from '@/pages/Dashboard/reportCards';
import { factService } from '@/services/domains/facts';
import { invokeQuery } from '@/services/ontology/client';
import { OT } from '@/services/ontology/object-types';
import { qb } from '@/services/ontology/query';

export interface ReportCardSummary {
  key: string;
  value: number;
  sub?: string;
  gauge?: number;
  sparkData: number[];
}

export interface DashboardStats {
  /** 全部居民数 */
  totalResidents: number;
  /** 活跃保障家庭 */
  activeHouseholds: number;
  /** 出勤率 */
  attendanceRate: string;
  /** 当月预警总数 */
  totalAlerts: number;
  /** 待处置预警 */
  activeAlerts: number;
  /** 已处置预警 */
  resolvedAlerts: number;
  /** 待审批材料数 */
  pending: number;
}

/** 首页待办计数 — 各审批流实体 UNDER_APPROVAL 数 + 待处置预警 */
export interface TodoCounts {
  leave: number;
  makeup: number;
  migrantWork: number;
  residenceChange: number;
  employmentChange: number;
  memberChange: number;
  application: number;
  termination: number;
  alert: number;
}

/** 打卡构成分项 */
export interface AttendanceBreakdown {
  total: number;
  /** 工作打卡 */
  employment: number;
  /** 居住打卡 */
  residence: number;
  /** 已打卡(有效) */
  checked: number;
  /** 未打卡(缺勤) */
  missed: number;
  /** 应打卡 */
  required: number;
  /** 待打卡 */
  pending: number;
}

/** 预警分项 */
export interface AlertBreakdown {
  total: number;
  /** 异常(无效) */
  invalid: number;
  /** 缺勤 */
  missed: number;
  /** 已读 */
  read: number;
  /** 未读 */
  unread: number;
}

/** 消息中心三类计数 */
export interface MessageCounts {
  /** 待办消息(审批结果) */
  todo: number;
  /** 业务通知(提醒/到期/其他) */
  business: number;
  /** 预警消息 */
  alert: number;
}

/** 居民激活分项 */
export interface ResidentBreakdown {
  activated: number;
  inactive: number;
}

export interface ChartPoint {
  date: string;
  value: number;
  type?: string;
}

/** 打卡率趋势点 */
export interface RateTrendPoint {
  date: string;
  rate: number;
}

/** 预警按类型趋势点 */
export interface AlertTrendPoint {
  date: string;
  invalid: number;
  missed: number;
}

/** 业务办理月度趋势点(多业务并列,key=业务键) */
export interface BizMonthlyPoint {
  /** 月份标签 YYYY-MM */
  month: string;
  application: number;
  allocation: number;
  subsidy: number;
  termination: number;
  migrantWork: number;
  change: number;
}

/** 档案规模对比项(快照类当前量) */
export interface ProfileScaleItem {
  key: string;
  label: string;
  value: number;
}

/** 资金发放月度趋势点 */
export interface FundMonthlyPoint {
  month: string;
  /** 个人收入合计 */
  income: number;
  /** 租赁补贴发放 */
  subsidy: number;
  /** 实物配租租金 */
  rent: number;
}

class DashboardStore {
  stats: DashboardStats | null = null;
  alertTrend: ChartPoint[] = [];
  /** 打卡率趋势(近7天每日出勤率%) */
  attendanceRateTrend: RateTrendPoint[] = [];
  /** 预警趋势(近7天每日 异常/缺勤 计数) */
  alertTypeTrend: AlertTrendPoint[] = [];
  /** 业务办理月度趋势(近12月) */
  bizMonthlyTrend: BizMonthlyPoint[] = [];
  /** 档案规模对比(快照类当前量) */
  profileScale: ProfileScaleItem[] = [];
  /** 资金发放月度趋势(近12月) */
  fundMonthlyTrend: FundMonthlyPoint[] = [];
  buildingStatus: ChartPoint[] = [];
  loading = false;
  /** 首页待办计数 */
  todoCounts: TodoCounts | null = null;
  /** 打卡构成分项 */
  attendanceBreakdown: AttendanceBreakdown | null = null;
  /** 预警分项 */
  alertBreakdown: AlertBreakdown | null = null;
  /** 消息中心三类计数 */
  messageCounts: MessageCounts | null = null;
  /** 居民激活分项 */
  residentBreakdown: ResidentBreakdown | null = null;
  /** 18 报表卡墙的汇总数据,key → summary */
  reportSummaries: Record<string, ReportCardSummary> = {};
  reportLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  setStats(stats: DashboardStats) {
    this.stats = stats;
  }

  setAlertTrend(data: ChartPoint[]) {
    this.alertTrend = data;
  }

  setBuildingStatus(data: ChartPoint[]) {
    this.buildingStatus = data;
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  async fetchStats() {
    this.setLoading(true);
    try {
      // 各项核心指标各自一次查询(让 mock 简单,真实后端可以一次聚合)
      const residentList = await invokeQuery(
        OT.Resident,
        qb(OT.Resident).page(1, 1).build(),
      );
      const householdList = await invokeQuery(
        OT.Household,
        qb(OT.Household).eq('status', 'ACTIVE').page(1, 1).build(),
      );
      const allFact = await factService.attendance.list({
        page: { pageNo: 1, pageSize: 1000 },
      });
      const eligibility = await invokeQuery(
        OT.EligibilityApplication,
        qb(OT.EligibilityApplication)
          .eq('status', 'UNDER_APPROVAL')
          .page(1, 1)
          .build(),
      );

      const factTotal = allFact.page?.total ?? allFact.data.length;
      const validCount = allFact.data.filter(
        (f: any) => f.attendanceStatus === 'VALID',
      ).length;
      const invalidCount = allFact.data.filter(
        (f: any) => f.attendanceStatus === 'INVALID',
      ).length;
      const missedCount = allFact.data.filter(
        (f: any) => f.attendanceStatus === 'MISSED',
      ).length;
      const alertCount = invalidCount + missedCount;

      // 打卡构成分项(按出勤类型 + 状态)
      const empCount = allFact.data.filter(
        (f: any) => f.attendanceType === 'EMPLOYMENT',
      ).length;
      const resCount = allFact.data.filter(
        (f: any) => f.attendanceType === 'RESIDENCE',
      ).length;
      const pendingCheckin = allFact.data.filter(
        (f: any) => f.attendanceStatus === 'PENDING',
      ).length;
      const exemptedCount = allFact.data.filter(
        (f: any) => f.attendanceStatus === 'EXEMPTED',
      ).length;
      const attendanceBreakdown: AttendanceBreakdown = {
        total: factTotal,
        employment: empCount,
        residence: resCount,
        checked: validCount,
        missed: missedCount,
        required: factTotal - exemptedCount,
        pending: pendingCheckin,
      };

      // 预警已读/未读(来自 Notification 中 ALERT 类型)
      let alertRead = 0;
      let alertUnread = 0;
      let msgTodo = 0;
      let msgBusiness = 0;
      let msgAlert = 0;
      try {
        const notiRes = await invokeQuery(
          OT.Notification,
          qb(OT.Notification).page(1, 500).build(),
        );
        for (const n of notiRes.data as any[]) {
          const t = n.notificationType;
          if (t === 'ALERT') {
            msgAlert++;
            if (n.status === 'READ') alertRead++;
            else alertUnread++;
          } else if (t === 'APPROVAL_RESULT') {
            msgTodo++;
          } else {
            msgBusiness++;
          }
        }
      } catch {
        // notification 未就绪时静默
      }

      // 待办计数:各审批流实体 UNDER_APPROVAL 数(并行查询)
      const countPending = async (objectType: string): Promise<number> => {
        try {
          const res = await invokeQuery(
            objectType,
            qb(objectType).eq('status', 'UNDER_APPROVAL').page(1, 1).build(),
          );
          return res.page?.total ?? res.data.length ?? 0;
        } catch {
          return 0;
        }
      };
      const [
        leaveN,
        makeupN,
        migrantN,
        residenceN,
        employmentN,
        memberN,
        terminationN,
      ] = await Promise.all([
        countPending(OT.Leave),
        countPending(OT.AttendanceMakeup),
        countPending(OT.MigrantWork),
        countPending(OT.ResidenceChange),
        countPending(OT.EmploymentChange),
        countPending(OT.HouseholdMemberChange),
        countPending(OT.EligibilityTermination),
      ]);

      // 居民激活分项:已激活 vs 未激活(草稿+未认证+已认证未激活)
      const countResidentStatus = async (status: string): Promise<number> => {
        try {
          const res = await invokeQuery(
            OT.Resident,
            qb(OT.Resident).eq('status', status).page(1, 1).build(),
          );
          return res.page?.total ?? res.data.length ?? 0;
        } catch {
          return 0;
        }
      };
      const [actN, draftN, unverN, verN] = await Promise.all([
        countResidentStatus('ACTIVATED'),
        countResidentStatus('DRAFT'),
        countResidentStatus('UNVERIFIED'),
        countResidentStatus('VERIFIED'),
      ]);

      runInAction(() => {
        this.residentBreakdown = {
          activated: actN,
          inactive: draftN + unverN + verN,
        };
      });

      runInAction(() => {
        this.todoCounts = {
          leave: leaveN,
          makeup: makeupN,
          migrantWork: migrantN,
          residenceChange: residenceN,
          employmentChange: employmentN,
          memberChange: memberN,
          application: eligibility.page?.total ?? 0,
          termination: terminationN,
          // 待处置预警 = 缺勤(MISSED),与 activeAlerts 一致
          alert: missedCount,
        };
        this.attendanceBreakdown = attendanceBreakdown;
        this.alertBreakdown = {
          total: alertCount,
          invalid: invalidCount,
          missed: missedCount,
          read: alertRead,
          unread: alertUnread,
        };
        this.messageCounts = {
          todo: msgTodo,
          business: msgBusiness,
          alert: msgAlert,
        };
      });

      runInAction(() => {
        this.stats = {
          totalResidents: residentList.page?.total ?? 0,
          activeHouseholds: householdList.page?.total ?? 0,
          attendanceRate:
            factTotal > 0
              ? `${Math.round((validCount / factTotal) * 100)}%`
              : '0%',
          totalAlerts: alertCount,
          activeAlerts: missedCount,
          resolvedAlerts: invalidCount,
          pending: eligibility.page?.total ?? 0,
        };
      });

      // 趋势:按日聚合最近 7 天
      const trend = aggregateByDay(allFact.data, 7);
      runInAction(() => {
        this.alertTrend = trend;
        this.attendanceRateTrend = aggregateRateByDay(allFact.data, 7);
        this.alertTypeTrend = aggregateAlertByDay(allFact.data, 7);
      });
    } catch (err) {
      console.error('fetchStats failed', err);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async fetchDashboardData() {
    await Promise.all([this.fetchStats(), this.fetchReportSummaries()]);
  }

  /**
   * 拉取 18 个报表的明细行,前端聚合出每张卡的头号指标 + sparkline。
   * (mock 网关不算 metrics,故拉明细在前端聚合;真实后端亦兼容。)
   */
  async fetchReportSummaries() {
    runInAction(() => {
      this.reportLoading = true;
    });
    try {
      // 保留每张报表的原始明细行,既算卡片汇总,也供合并图表按月聚合
      const rowsByKey: Record<string, Record<string, any>[]> = {};
      const results = await Promise.all(
        reportCards.map(async (card) => {
          try {
            const env = await card.service.list({
              page: { pageNo: 1, pageSize: 1000 },
            });
            const rows = (env.data as Record<string, any>[]) ?? [];
            rowsByKey[card.key] = rows;
            const { value, sub, gauge } = card.summarize(rows);
            const sparkData = card.sparkData ? card.sparkData(rows) : [];
            return {
              key: card.key,
              value,
              sub,
              gauge,
              sparkData,
            } as ReportCardSummary;
          } catch {
            rowsByKey[card.key] = [];
            return {
              key: card.key,
              value: 0,
              sparkData: [],
            } as ReportCardSummary;
          }
        }),
      );
      runInAction(() => {
        const map: Record<string, ReportCardSummary> = {};
        for (const r of results) map[r.key] = r;
        this.reportSummaries = map;
        // 合并图表数据集(近 12 个月)
        this.bizMonthlyTrend = buildBizMonthly(rowsByKey, 12);
        this.fundMonthlyTrend = buildFundMonthly(rowsByKey, 12);
        this.profileScale = buildProfileScale(rowsByKey);
      });
    } finally {
      runInAction(() => {
        this.reportLoading = false;
      });
    }
  }
}

function aggregateByDay(facts: any[], days: number): ChartPoint[] {
  const buckets = new Map<string, { valid: number; alert: number }>();
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000).toISOString().slice(0, 10);
    buckets.set(d, { valid: 0, alert: 0 });
  }
  for (const f of facts) {
    const d = String(f.checkIn ?? '').slice(0, 10);
    const b = buckets.get(d);
    if (!b) continue;
    if (f.attendanceStatus === 'VALID') b.valid++;
    else if (
      f.attendanceStatus === 'INVALID' ||
      f.attendanceStatus === 'MISSED'
    )
      b.alert++;
  }
  const out: ChartPoint[] = [];
  buckets.forEach((v, date) => {
    out.push({ date, value: v.valid, type: '正常' });
    out.push({ date, value: v.alert, type: '异常' });
  });
  return out;
}

/** 按日出勤率%(VALID / 非EXEMPTED 总数) */
function aggregateRateByDay(facts: any[], days: number): RateTrendPoint[] {
  const buckets = new Map<string, { valid: number; required: number }>();
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    buckets.set(new Date(now - i * 86400000).toISOString().slice(0, 10), {
      valid: 0,
      required: 0,
    });
  }
  for (const f of facts) {
    const d = String(f.checkIn ?? f.deadline ?? '').slice(0, 10);
    const b = buckets.get(d);
    if (!b) continue;
    if (f.attendanceStatus !== 'EXEMPTED') b.required++;
    if (f.attendanceStatus === 'VALID') b.valid++;
  }
  return Array.from(buckets.entries()).map(([date, v]) => ({
    date: date.slice(5),
    rate: v.required > 0 ? Math.round((v.valid / v.required) * 1000) / 10 : 0,
  }));
}

/** 按日预警计数(异常 INVALID / 缺勤 MISSED) */
function aggregateAlertByDay(facts: any[], days: number): AlertTrendPoint[] {
  const buckets = new Map<string, { invalid: number; missed: number }>();
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    buckets.set(new Date(now - i * 86400000).toISOString().slice(0, 10), {
      invalid: 0,
      missed: 0,
    });
  }
  for (const f of facts) {
    const d = String(f.checkIn ?? f.deadline ?? '').slice(0, 10);
    const b = buckets.get(d);
    if (!b) continue;
    if (f.attendanceStatus === 'INVALID') b.invalid++;
    else if (f.attendanceStatus === 'MISSED') b.missed++;
  }
  return Array.from(buckets.entries()).map(([date, v]) => ({
    date: date.slice(5),
    invalid: v.invalid,
    missed: v.missed,
  }));
}

export default DashboardStore;

// ============================================================
// 合并图表聚合工具(近 N 月)
// ============================================================

/** 从一行 fact(可能嵌套实体)里尽力提取一个日期字符串 */
function pickDate(row: Record<string, any>, candidates: string[]): string {
  for (const path of candidates) {
    // 支持 "a.b" 形式的嵌套取值
    const v = path.split('.').reduce<any>((o, k) => (o == null ? o : o[k]), row);
    if (v) return String(v);
  }
  return '';
}

/** 生成近 months 个月的 YYYY-MM 标签序列 */
function monthKeys(months: number): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = months - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(
      `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`,
    );
  }
  return out;
}

/** 把任意日期字符串归一到 YYYY-MM */
function toMonth(s: string): string {
  return s ? s.slice(0, 7) : '';
}

/** 业务办理月度趋势(6 类业务按月计数) */
function buildBizMonthly(
  rowsByKey: Record<string, any[]>,
  months: number,
): BizMonthlyPoint[] {
  const keys = monthKeys(months);
  const init = () =>
    new Map<string, number>(keys.map((k) => [k, 0]));
  const buckets = {
    application: init(),
    allocation: init(),
    subsidy: init(),
    termination: init(),
    migrantWork: init(),
    change: init(),
  };

  const tally = (
    bucket: Map<string, number>,
    rows: any[] | undefined,
    dateFields: string[],
  ) => {
    for (const r of rows ?? []) {
      const m = toMonth(pickDate(r, dateFields));
      if (bucket.has(m)) bucket.set(m, (bucket.get(m) ?? 0) + 1);
    }
  };

  // 申请审批类:用提交时间(回退 createAt)
  tally(buckets.application, rowsByKey.eligibilityApplication, [
    'submittedAt',
    'reviewStartDate',
    'createAt',
    'application.submittedAt',
  ]);
  tally(buckets.termination, rowsByKey.eligibilityTermination, [
    'effectiveDate',
    'submittedAt',
    'createAt',
    'termination.submittedAt',
  ]);
  // 配租/补贴:用开始/租赁开始日期(seed 用 effectiveFrom,回退 createAt)
  tally(buckets.allocation, rowsByKey.housingAllocation, [
    'leaseStartDate',
    'effectiveFrom',
    'createAt',
    'allocation.createAt',
  ]);
  tally(buckets.subsidy, rowsByKey.rentalSubsidy, [
    'startDate',
    'effectiveFrom',
    'createAt',
    'subsidy.createAt',
  ]);
  tally(buckets.migrantWork, rowsByKey.migrantWork, [
    'startDate',
    'submittedAt',
    'createAt',
    'migrantWork.submittedAt',
  ]);
  // 三类变更合并成一条"变更"线
  for (const k of [
    'householdMemberChange',
    'residenceChange',
    'employmentChange',
  ]) {
    tally(buckets.change, rowsByKey[k], [
      'submittedAt',
      'createAt',
      'memberChange.submittedAt',
      'memberChange.createAt',
      'residenceChange.submittedAt',
      'employmentChange.submittedAt',
    ]);
  }

  return keys.map((month) => ({
    month: month.slice(5), // MM
    application: buckets.application.get(month) ?? 0,
    allocation: buckets.allocation.get(month) ?? 0,
    subsidy: buckets.subsidy.get(month) ?? 0,
    termination: buckets.termination.get(month) ?? 0,
    migrantWork: buckets.migrantWork.get(month) ?? 0,
    change: buckets.change.get(month) ?? 0,
  }));
}

/** 资金发放月度趋势(收入/补贴/配租租金,按金额求和) */
function buildFundMonthly(
  rowsByKey: Record<string, any[]>,
  months: number,
): FundMonthlyPoint[] {
  const keys = monthKeys(months);
  const init = () => new Map<string, number>(keys.map((k) => [k, 0]));
  const income = init();
  const subsidy = init();
  const rent = init();

  const sumInto = (
    bucket: Map<string, number>,
    rows: any[] | undefined,
    dateFields: string[],
    amountFields: string[],
  ) => {
    for (const r of rows ?? []) {
      const m = toMonth(pickDate(r, dateFields));
      if (!bucket.has(m)) continue;
      let amt = 0;
      for (const af of amountFields) {
        if (r[af] != null) {
          amt = Number(r[af]) || 0;
          break;
        }
      }
      bucket.set(m, (bucket.get(m) ?? 0) + amt);
    }
  };

  sumInto(
    income,
    rowsByKey.personalIncome,
    ['period', 'reportPeriod', 'createAt'],
    ['incomeAmount', 'amount'],
  );
  sumInto(
    subsidy,
    rowsByKey.rentalSubsidy,
    ['startDate', 'effectiveFrom', 'createAt'],
    ['activeMonthlyEntitlementAmount', 'monthlyEntitlementAmount', 'monthlyAmount'],
  );
  sumInto(
    rent,
    rowsByKey.housingAllocation,
    ['leaseStartDate', 'effectiveFrom', 'createAt'],
    ['activeMonthlyRentAmount', 'monthlyRentAmount', 'rentAmount'],
  );

  return keys.map((month) => ({
    month: month.slice(5),
    income: Math.round(income.get(month) ?? 0),
    subsidy: Math.round(subsidy.get(month) ?? 0),
    rent: Math.round(rent.get(month) ?? 0),
  }));
}

/** 档案规模对比(快照类当前量) */
function buildProfileScale(
  rowsByKey: Record<string, any[]>,
): ProfileScaleItem[] {
  const len = (k: string) => (rowsByKey[k] ?? []).length;
  return [
    { key: 'resident', label: '居民', value: len('residentSnapshot') },
    { key: 'household', label: '家庭', value: len('householdSnapshot') },
    { key: 'member', label: '家庭成员', value: len('householdMemberSnapshot') },
    { key: 'residence', label: '居住信息', value: len('residenceSnapshot') },
    { key: 'employment', label: '工作信息', value: len('employmentSnapshot') },
  ];
}
