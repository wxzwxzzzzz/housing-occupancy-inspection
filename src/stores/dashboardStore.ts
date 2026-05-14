import { makeAutoObservable } from 'mobx';

export interface DashboardStats {
  totalBuildings?: number;
  totalAlerts?: number;
  activeAlerts?: number;
  resolvedAlerts?: number;
  attendanceRate?: string;
  alerts?: number;
  pending?: number;
  [key: string]: any; // 允许其他字段
}

export interface ChartData {
  date: string;
  value: number;
  type?: string;
}

class DashboardStore {
  stats: DashboardStats | null = null;
  alertTrend: ChartData[] = [];
  buildingStatus: ChartData[] = [];
  loading: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setStats(stats: DashboardStats) {
    this.stats = stats;
  }

  setAlertTrend(data: ChartData[]) {
    this.alertTrend = data;
  }

  setBuildingStatus(data: ChartData[]) {
    this.buildingStatus = data;
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  async fetchStats() {
    this.setLoading(true);
    try {
      // TODO: 从 API 获取数据
      // 模拟数据
      this.setStats({
        attendanceRate: '95%',
        alerts: 12,
        pending: 5,
        totalBuildings: 20,
        totalAlerts: 12,
        activeAlerts: 5,
        resolvedAlerts: 7,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      this.setLoading(false);
    }
  }

  async fetchDashboardData() {
    await this.fetchStats();
    try {
      // TODO: 从 API 获取图表数据
      // this.setAlertTrend(response.alertTrend);
      // this.setBuildingStatus(response.buildingStatus);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  }
}

export default DashboardStore;
