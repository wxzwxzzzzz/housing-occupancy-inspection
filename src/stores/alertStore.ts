import { makeAutoObservable } from 'mobx';

export interface Alert {
  id: string;
  title: string;
  content: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  status: 'pending' | 'processing' | 'resolved';
  createTime: string;
  updateTime: string;
  location?: string;
  buildingId?: string;
}

class AlertStore {
  alerts: Alert[] = [];
  loading: boolean = false;
  total: number = 0;

  constructor() {
    makeAutoObservable(this);
  }

  setAlerts(alerts: Alert[]) {
    this.alerts = alerts;
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setTotal(total: number) {
    this.total = total;
  }

  addAlert(alert: Alert) {
    this.alerts.unshift(alert);
    this.total += 1;
  }

  updateAlert(id: string, updates: Partial<Alert>) {
    const index = this.alerts.findIndex((alert) => alert.id === id);
    if (index !== -1) {
      this.alerts[index] = { ...this.alerts[index], ...updates };
    }
  }

  removeAlert(id: string) {
    this.alerts = this.alerts.filter((alert) => alert.id !== id);
    this.total -= 1;
  }

  get unreadCount() {
    return this.alerts.filter((alert) => alert.status === 'pending').length;
  }

  get criticalAlerts() {
    return this.alerts.filter((alert) => alert.level === 'critical');
  }
}

export default AlertStore;
