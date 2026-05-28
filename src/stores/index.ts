import AlertStore from './alertStore';
import AppStore from './appStore';
import ConfigStore from './configStore';
import DashboardStore from './dashboardStore';
import { dictStore } from './dictStore';
import UserStore from './userStore';

// 创建单例实例
export const userStore = new UserStore();
export const appStore = new AppStore();
export const alertStore = new AlertStore();
export const configStore = new ConfigStore();
export const dashboardStore = new DashboardStore();

export type { ThemeMode } from './appStore';
export {
  dictLabel,
  useEnumOptions,
} from './dictStore';
// 导出类型
export {
  AlertStore,
  AppStore,
  ConfigStore,
  DashboardStore,
  dictStore,
  UserStore,
};

// 导出 useStores hook（用于需要在组件中使用多个 store 的场景）
export const useStores = () => ({
  userStore,
  appStore,
  alertStore,
  configStore,
  dashboardStore,
  dictStore,
});
