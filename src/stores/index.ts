import UserStore from './userStore';
import AppStore from './appStore';
import AlertStore from './alertStore';
import ConfigStore from './configStore';
import DashboardStore from './dashboardStore';

// 创建单例实例
export const userStore = new UserStore();
export const appStore = new AppStore();
export const alertStore = new AlertStore();
export const configStore = new ConfigStore();
export const dashboardStore = new DashboardStore();

// 导出类型
export { UserStore, AppStore, AlertStore, ConfigStore, DashboardStore };

// 导出 useStores hook（用于需要在组件中使用多个 store 的场景）
export const useStores = () => ({
  userStore,
  appStore,
  alertStore,
  configStore,
  dashboardStore,
});
