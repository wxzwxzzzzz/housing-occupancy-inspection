/**
 * 首页「18 报表卡墙」配置
 *
 * 每张卡对应一个 Fact 报表:声明从该 Fact 的明细行如何聚合出"头号指标",
 * 以及迷你图类型 / 颜色 / 跳转路由 / 所属分组。
 *
 * 为什么前端聚合:mock 网关不计算 SEMANTIC_MODEL 的 metrics(只 filter/sort/page),
 * 所以首页直接拉明细行、在前端 count/sum,既能在 mock 下出真数,真实后端也兼容。
 */

import { factService } from '@/services/domains/facts';
import type { EntityApi } from '@/services/ontology/crud';

export type SparkType = 'area' | 'line' | 'column' | 'gauge';

export interface ReportCardConfig {
  key: string;
  /** 卡片标题 */
  title: string;
  /** 分组 */
  group: '监测预警' | '档案快照' | '收入与考勤' | '业务与变更';
  /** 数据源(Fact 服务) */
  service: EntityApi<any>;
  /** 跳转路由 */
  path: string;
  /** 迷你图类型 */
  spark: SparkType;
  /** sparkline 颜色 */
  color: string;
  /** 头号指标的展示格式 */
  format?: 'integer' | 'percent' | 'currency';
  /**
   * 从该 Fact 的明细行数组聚合出"头号指标"数值。
   * 返回 { value, sub? }:value 为大数字,sub 为副文案。
   */
  summarize: (rows: Record<string, any>[]) => {
    value: number;
    sub?: string;
    gauge?: number;
  };
  /**
   * 从明细行生成近 N 天 sparkline 序列(可选,缺省用占位)。
   */
  sparkData?: (rows: Record<string, any>[]) => number[];
}

// ---------- 聚合小工具 ----------
const cnt = (rows: any[]) => rows.length;
const cntIf = (rows: any[], pred: (r: any) => boolean) =>
  rows.filter(pred).length;
const sumBy = (rows: any[], f: (r: any) => number) =>
  rows.reduce((a, r) => a + (Number(f(r)) || 0), 0);

/** 取某字段近 7 天按日计数序列 */
function dailyCount(rows: any[], dateField: string, days = 7): number[] {
  const buckets = new Map<string, number>();
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    buckets.set(new Date(now - i * 86400000).toISOString().slice(0, 10), 0);
  }
  for (const r of rows) {
    const d = String(r[dateField] ?? '').slice(0, 10);
    if (buckets.has(d)) buckets.set(d, buckets.get(d)! + 1);
  }
  return Array.from(buckets.values());
}

// ============================================================================
// 18 张卡配置
// ============================================================================

export const reportCards: ReportCardConfig[] = [
  // -------- 监测预警 --------
  {
    key: 'alert',
    title: '监测预警',
    group: '监测预警',
    service: factService.attendance,
    path: '/report/attendance-alert',
    spark: 'column',
    color: '#cf1322',
    summarize: (rows) => {
      const invalid = cntIf(rows, (r) => r.attendanceStatus === 'INVALID');
      const missed = cntIf(rows, (r) => r.attendanceStatus === 'MISSED');
      return {
        value: invalid + missed,
        sub: `异常 ${invalid} · 缺勤 ${missed}`,
      };
    },
    sparkData: (rows) =>
      dailyCount(
        rows.filter(
          (r) =>
            r.attendanceStatus === 'INVALID' || r.attendanceStatus === 'MISSED',
        ),
        'checkIn',
      ),
  },

  // -------- 档案快照 --------
  {
    key: 'residentSnapshot',
    title: '居民快照',
    group: '档案快照',
    service: factService.residentSnapshot,
    path: '/report/resident-snapshot',
    spark: 'line',
    color: '#1677ff',
    summarize: (rows) => ({
      value: cnt(rows),
      sub: `已激活 ${cntIf(rows, (r) => r.residentStatus === 'ACTIVATED' || r.status === 'ACTIVATED')}`,
    }),
  },
  {
    key: 'householdSnapshot',
    title: '家庭快照',
    group: '档案快照',
    service: factService.householdSnapshot,
    path: '/report/household-snapshot',
    spark: 'line',
    color: '#1677ff',
    summarize: (rows) => ({
      value: cntIf(rows, (r) => (r.householdStatus ?? r.status) === 'ACTIVE'),
      sub: `候选 ${cntIf(rows, (r) => (r.householdStatus ?? r.status) === 'CANDIDATE')}`,
    }),
  },
  {
    key: 'householdMemberSnapshot',
    title: '家庭成员',
    group: '档案快照',
    service: factService.householdMemberSnapshot,
    path: '/report/household-member-snapshot',
    spark: 'line',
    color: '#1677ff',
    summarize: (rows) => ({
      value: cnt(rows),
      sub: `计入人口 ${cntIf(rows, (r) => r.included === true || r.isIncluded === true)}`,
    }),
  },
  {
    key: 'residenceSnapshot',
    title: '居住信息',
    group: '档案快照',
    service: factService.residenceSnapshot,
    path: '/report/residence-snapshot',
    spark: 'area',
    color: '#1677ff',
    summarize: (rows) => ({
      value: cntIf(
        rows,
        (r) => r.monitoringTarget === true || r.isMonitoringTarget === true,
      ),
      sub: `共 ${cnt(rows)} 条记录`,
    }),
  },
  {
    key: 'employmentSnapshot',
    title: '工作信息',
    group: '档案快照',
    service: factService.employmentSnapshot,
    path: '/report/employment-snapshot',
    spark: 'area',
    color: '#1677ff',
    summarize: (rows) => ({
      value: cntIf(
        rows,
        (r) => r.monitoringTarget === true || r.isMonitoringTarget === true,
      ),
      sub: `共 ${cnt(rows)} 条记录`,
    }),
  },

  // -------- 收入与考勤 --------
  {
    key: 'personalIncome',
    title: '个人收入',
    group: '收入与考勤',
    service: factService.personalIncome,
    path: '/report/personal-income',
    spark: 'area',
    color: '#1677ff',
    format: 'currency',
    summarize: (rows) => ({
      value: sumBy(rows, (r) => r.amount),
      sub: `${cnt(rows)} 条收入记录`,
    }),
  },
  {
    key: 'attendance',
    title: '考勤打卡',
    group: '收入与考勤',
    service: factService.attendance,
    path: '/report/attendance',
    spark: 'gauge',
    color: '#52c41a',
    format: 'percent',
    summarize: (rows) => {
      const total = cnt(rows);
      const valid = cntIf(rows, (r) => r.attendanceStatus === 'VALID');
      const rate = total > 0 ? valid / total : 0;
      return {
        value: Math.round(rate * 100),
        sub: `有效 ${valid} / ${total}`,
        gauge: rate,
      };
    },
  },
  {
    key: 'leave',
    title: '请假',
    group: '收入与考勤',
    service: factService.leave,
    path: '/report/leave',
    spark: 'column',
    color: '#1677ff',
    summarize: (rows) => ({
      value: cntIf(
        rows,
        (r) => (r.leaveStatus ?? r.status) === 'UNDER_APPROVAL',
      ),
      sub: `共 ${cnt(rows)} 条`,
    }),
  },
  {
    key: 'attendanceMakeup',
    title: '补卡申请',
    group: '收入与考勤',
    service: factService.attendanceMakeup,
    path: '/report/attendance-makeup',
    spark: 'column',
    color: '#1677ff',
    summarize: (rows) => ({
      value: cntIf(
        rows,
        (r) => (r.makeupStatus ?? r.status) === 'UNDER_APPROVAL',
      ),
      sub: `共 ${cnt(rows)} 条`,
    }),
  },

  // -------- 业务与变更 --------
  {
    key: 'eligibilityApplication',
    title: '资质申请',
    group: '业务与变更',
    service: factService.eligibilityApplication,
    path: '/report/eligibility-application',
    spark: 'column',
    color: '#1677ff',
    summarize: (rows) => ({
      value: cntIf(
        rows,
        (r) => (r.applicationStatus ?? r.status) === 'UNDER_APPROVAL',
      ),
      sub: `共 ${cnt(rows)} 条`,
    }),
  },
  {
    key: 'housingAllocation',
    title: '实物配租',
    group: '业务与变更',
    service: factService.housingAllocation,
    path: '/report/housing-allocation',
    spark: 'line',
    color: '#1677ff',
    summarize: (rows) => ({
      value: cntIf(
        rows,
        (r) => (r.allocationStatus ?? r.status) === 'ALLOC_ACTIVE',
      ),
      sub: `共 ${cnt(rows)} 条`,
    }),
  },
  {
    key: 'rentalSubsidy',
    title: '租赁补贴',
    group: '业务与变更',
    service: factService.rentalSubsidy,
    path: '/report/rental-subsidy',
    spark: 'area',
    color: '#1677ff',
    format: 'currency',
    summarize: (rows) => ({
      value: sumBy(
        rows.filter((r) => (r.subsidyStatus ?? r.status) === 'SUBSIDY_ACTIVE'),
        (r) => r.monthlyAmount,
      ),
      sub: `生效 ${cntIf(rows, (r) => (r.subsidyStatus ?? r.status) === 'SUBSIDY_ACTIVE')} 户`,
    }),
  },
  {
    key: 'eligibilityTermination',
    title: '资格终止',
    group: '业务与变更',
    service: factService.eligibilityTermination,
    path: '/report/eligibility-termination',
    spark: 'column',
    color: '#1677ff',
    summarize: (rows) => ({
      value: cntIf(
        rows,
        (r) => (r.terminationStatus ?? r.status) === 'UNDER_APPROVAL',
      ),
      sub: `共 ${cnt(rows)} 条`,
    }),
  },
  {
    key: 'migrantWork',
    title: '外出务工',
    group: '业务与变更',
    service: factService.migrantWork,
    path: '/report/migrant-work',
    spark: 'column',
    color: '#1677ff',
    summarize: (rows) => ({
      value: cnt(rows),
      sub: `审批中 ${cntIf(rows, (r) => (r.migrantWorkStatus ?? r.status) === 'UNDER_APPROVAL')}`,
    }),
  },
  {
    key: 'householdMemberChange',
    title: '成员变更',
    group: '业务与变更',
    service: factService.householdMemberChange,
    path: '/report/household-member-change',
    spark: 'column',
    color: '#1677ff',
    summarize: (rows) => ({
      value: cnt(rows),
      sub: `审批中 ${cntIf(rows, (r) => (r.changeStatus ?? r.status) === 'UNDER_APPROVAL')}`,
    }),
  },
  {
    key: 'residenceChange',
    title: '居住变更',
    group: '业务与变更',
    service: factService.residenceChange,
    path: '/report/residence-change',
    spark: 'column',
    color: '#1677ff',
    summarize: (rows) => ({
      value: cnt(rows),
      sub: `审批中 ${cntIf(rows, (r) => (r.changeStatus ?? r.status) === 'UNDER_APPROVAL')}`,
    }),
  },
  {
    key: 'employmentChange',
    title: '工作变更',
    group: '业务与变更',
    service: factService.employmentChange,
    path: '/report/employment-change',
    spark: 'column',
    color: '#1677ff',
    summarize: (rows) => ({
      value: cnt(rows),
      sub: `审批中 ${cntIf(rows, (r) => (r.changeStatus ?? r.status) === 'UNDER_APPROVAL')}`,
    }),
  },
];

export const reportCardGroups = [
  '监测预警',
  '档案快照',
  '收入与考勤',
  '业务与变更',
] as const;

/** 顶部 highlight 卡(打卡率 + 监测预警),从卡墙抽出避免重复 */
export const highlightCardKeys = ['attendance', 'alert'] as const;

/** 顶部 highlight 卡 */
export const highlightCards: ReportCardConfig[] = reportCards.filter((c) =>
  (highlightCardKeys as readonly string[]).includes(c.key),
);

/** 卡墙卡(16 张:全部报表去掉已在顶部 highlight 的 2 张),连续平铺无分组 */
export const wallCards: ReportCardConfig[] = reportCards.filter(
  (c) => !(highlightCardKeys as readonly string[]).includes(c.key),
);
