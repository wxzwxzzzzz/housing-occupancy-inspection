import '@ant-design/v5-patch-for-react-19';
import { history } from '@umijs/max';
import { userStore, appStore, dashboardStore } from './stores';

const loginPath = '/login';

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 */
export async function getInitialState(): Promise<{
  currentUser?: any;
  loading?: boolean;
}> {
  await userStore.fetchCurrentUser();

  // 初始化应用和菜单
  appStore.setApps([
    { id: 'dashboard', name: '工作台', route: '/dashboard', enabled: true },
    { id: 'approval', name: '审批管理', route: '/approval', enabled: true },
  ]);
  appStore.setMenus(appStore.buildMenusFromApps());

  // 获取仪表盘数据
  await dashboardStore.fetchStats();

  const { location } = history;
  if (location.pathname !== loginPath) {
    return {
      currentUser: userStore.user,
    };
  }
  return {};
}
