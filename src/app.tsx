import '@ant-design/v5-patch-for-react-19';
import { history } from '@umijs/max';
import { errorConfig } from './requestErrorConfig';
import { appStore, dashboardStore, dictStore, userStore } from './stores';
import type { CurrentUser } from './stores/userStore';

// 应用启动时立刻同步主题模式到 html data-theme,避免页面加载闪白
if (typeof document !== 'undefined') {
  document.documentElement.dataset.theme = appStore.themeMode;
}

const loginPath = '/login';

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 */
export async function getInitialState(): Promise<{
  currentUser?: CurrentUser | null;
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
  // 字典中心:登录后尝试拉一次运行时字典覆盖。失败也不阻塞,前端会用 EnumLabels 默认值。
  void dictStore.refresh().catch(() => undefined);

  return {
    currentUser: userStore.user,
  };
}

/**
 * 注册全局请求配置(拦截器、错误处理)。
 * @see https://umijs.org/docs/max/request
 */
export const request = errorConfig;
