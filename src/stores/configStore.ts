import { makeAutoObservable } from 'mobx';

export interface SystemConfig {
  siteName: string;
  siteUrl: string;
  contactEmail: string;
  maxUploadSize: number;
  alertThreshold: {
    temperature: number;
    humidity: number;
    vibration: number;
  };
}

class ConfigStore {
  config: SystemConfig = {
    siteName: '房屋监测管理系统',
    siteUrl: '',
    contactEmail: '',
    maxUploadSize: 10 * 1024 * 1024, // 10MB
    alertThreshold: {
      temperature: 35,
      humidity: 80,
      vibration: 5,
    },
  };

  loading: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setConfig(config: Partial<SystemConfig>) {
    this.config = { ...this.config, ...config };
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  updateAlertThreshold(key: keyof SystemConfig['alertThreshold'], value: number) {
    this.config.alertThreshold[key] = value;
  }
}

export default ConfigStore;
