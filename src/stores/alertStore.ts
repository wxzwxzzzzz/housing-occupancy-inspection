import { makeAutoObservable, runInAction } from 'mobx';
import { alertService, type AlertItem } from '@/services/domains/alert';
import type { AlertLevel } from '@/types/ontology/prh/enums';

class AlertStore {
  alerts: AlertItem[] = [];
  loading = false;
  total = 0;

  constructor() {
    makeAutoObservable(this);
  }

  setAlerts(alerts: AlertItem[]) {
    this.alerts = alerts;
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setTotal(total: number) {
    this.total = total;
  }

  addAlert(alert: AlertItem) {
    this.alerts.unshift(alert);
    this.total += 1;
  }

  updateAlert(id: string, updates: Partial<AlertItem>) {
    const idx = this.alerts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.alerts[idx] = { ...this.alerts[idx], ...updates };
    }
  }

  removeAlert(id: string) {
    this.alerts = this.alerts.filter((a) => a.id !== id);
    this.total = Math.max(0, this.total - 1);
  }

  get unreadCount() {
    return this.alerts.filter((a) => a.status === 'pending').length;
  }

  get criticalAlerts() {
    return this.alerts.filter((a) => a.level === 'ALERT_RED');
  }

  async fetchAlerts(params?: { pageNo?: number; pageSize?: number; level?: AlertLevel }) {
    this.setLoading(true);
    try {
      const result = await alertService.list(params);
      runInAction(() => {
        this.alerts = result.data;
        this.total = result.page?.total ?? result.data.length;
      });
    } catch (err) {
      console.error('fetchAlerts failed', err);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

export default AlertStore;
