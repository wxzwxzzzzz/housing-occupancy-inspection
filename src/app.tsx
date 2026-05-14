import '@ant-design/v5-patch-for-react-19';
import { history } from '@umijs/max';
import { userStore, appStore, dashboardStore } from './stores';
import { errorConfig } from './requestErrorConfig';

const loginPath = '/login';

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 */
export async function getInitialState(): Promise<{
  currentUser?: any;
  loading?: boolean;
}> {
  const { location } = history;

  // 未登录直接放行到 /login,不去拉用户信息(避免 401 循环)
  if (location.pathname === loginPath) {
    return {};
  }

  await userStore.fetchCurrentUser();

  if (!userStore.isLoggedIn) {
    history.replace(loginPath);
    return {};
  }

  appStore.setApps([
    { id: 'dashboard', name: '工作台', route: '/dashboard', enabled: true },
    { id: 'monitor', name: '监测与处置', route: '/monitor', enabled: true },
    { id: 'approval', name: '申请与审批', route: '/approval', enabled: true },
    { id: 'report', name: '分析与报表', route: '/report', enabled: true },
    { id: 'system', name: '系统与运维', route: '/system', enabled: true },
  ]);
  appStore.setMenus(appStore.buildMenusFromApps());

  // 仪表盘数据失败不阻塞应用启动
  void dashboardStore.fetchStats().catch(() => undefined);

  return {
    currentUser: userStore.user,
  };
}

/**
 * 注册全局请求配置(拦截器、错误处理)。
 * @see https://umijs.org/docs/max/request
 */
export const request = errorConfig;
