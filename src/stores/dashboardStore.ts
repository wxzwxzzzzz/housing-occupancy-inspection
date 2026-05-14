import { makeAutoObservable, runInAction } from 'mobx';
import { factService } from '@/services/domains/facts';
import { qb } from '@/services/ontology/query';
import { OT } from '@/services/ontology/object-types';
import { invokeQuery } from '@/services/ontology/client';

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

export interface ChartPoint {
  date: string;
  value: number;
  type?: string;
}

class DashboardStore {
  stats: DashboardStats | null = null;
  alertTrend: ChartPoint[] = [];
  buildingStatus: ChartPoint[] = [];
  loading = false;

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
      const allFact = await factService.attendance.list({ page: { pageNo: 1, pageSize: 1000 } });
      const eligibility = await invokeQuery(
        OT.EligibilityApplication,
        qb(OT.EligibilityApplication).eq('status', 'UNDER_APPROVAL').page(1, 1).build(),
      );

      const factTotal = allFact.page?.total ?? allFact.data.length;
      const validCount = allFact.data.filter((f: any) => f.attendanceStatus === 'VALID').length;
      const invalidCount = allFact.data.filter((f: any) => f.attendanceStatus === 'INVALID').length;
      const missedCount = allFact.data.filter((f: any) => f.attendanceStatus === 'MISSED').length;
      const alertCount = invalidCount + missedCount;

      runInAction(() => {
        this.stats = {
          totalResidents: residentList.page?.total ?? 0,
          activeHouseholds: householdList.page?.total ?? 0,
          attendanceRate:
            factTotal > 0 ? `${Math.round((validCount / factTotal) * 100)}%` : '0%',
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
    await this.fetchStats();
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
    else if (f.attendanceStatus === 'INVALID' || f.attendanceStatus === 'MISSED') b.alert++;
  }
  const out: ChartPoint[] = [];
  buckets.forEach((v, date) => {
    out.push({ date, value: v.valid, type: '正常' });
    out.push({ date, value: v.alert, type: '异常' });
  });
  return out;
}

export default DashboardStore;
