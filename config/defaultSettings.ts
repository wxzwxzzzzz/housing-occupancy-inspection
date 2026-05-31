import type { ProLayoutProps } from '@ant-design/pro-components';

/**
 * 公租房保障监测系统 — 全局主题配置
 *
 * 配色参考 HTML 原型(Tabler UI):
 *   - 浅色主题 + 深蓝主色(#1d4ed8,接近 Tabler #206bc4)
 *   - 侧边栏浅色底,选中态主色高亮
 *   - 克制、信息密度高、无彩色装饰
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  colorPrimary: '#1d4ed8',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: '公租房保障监测',
  pwa: true,
  logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  iconfontUrl: '',
  token: {},
};

export default Settings;
