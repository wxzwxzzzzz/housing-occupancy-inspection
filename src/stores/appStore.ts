import { makeAutoObservable } from 'mobx';

export interface AppItem {
  id: string;
  name: string;
  route: string;
  enabled: boolean;
  icon?: string;
}

export interface MenuItem {
  path: string;
  name: string;
  icon?: string;
  children?: MenuItem[];
}

export type ThemeMode = 'light' | 'dark';

const PRIMARY_COLOR_KEY = 'prh:primaryColor';
const THEME_MODE_KEY = 'prh:themeMode';
const DEFAULT_PRIMARY = '#1d4ed8';
const DEFAULT_MODE: ThemeMode = 'light';

class AppStore {
  primaryColor: string = DEFAULT_PRIMARY;
  themeMode: ThemeMode = DEFAULT_MODE;
  loading: boolean = false;
  collapsed: boolean = false;
  apps: AppItem[] = [];
  menus: MenuItem[] = [];

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const v = localStorage.getItem(PRIMARY_COLOR_KEY);
      if (v) this.primaryColor = v;
      const m = localStorage.getItem(THEME_MODE_KEY);
      if (m === 'light' || m === 'dark') this.themeMode = m;
    } catch {}
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setCollapsed(collapsed: boolean) {
    this.collapsed = collapsed;
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
  }

  setPrimaryColor(color: string) {
    this.primaryColor = color;
    try {
      localStorage.setItem(PRIMARY_COLOR_KEY, color);
    } catch {}
  }

  setThemeMode(mode: ThemeMode) {
    this.themeMode = mode;
    try {
      localStorage.setItem(THEME_MODE_KEY, mode);
    } catch {}
    // 同步到 html data 属性,便于全局 CSS 区分
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = mode;
    }
  }

  get isDark(): boolean {
    return this.themeMode === 'dark';
  }

  setApps(apps: AppItem[]) {
    this.apps = apps;
  }

  setMenus(menus: MenuItem[]) {
    this.menus = menus;
  }

  buildMenusFromApps(): MenuItem[] {
    return this.apps
      .filter((app) => app.enabled)
      .map((app) => ({
        path: app.route,
        name: app.name,
        icon: app.icon,
      }));
  }

  disableApp(appId: string) {
    const app = this.apps.find((a) => a.id === appId);
    if (app) {
      app.enabled = false;
      this.menus = this.buildMenusFromApps();
    }
  }

  enableApp(appId: string) {
    const app = this.apps.find((a) => a.id === appId);
    if (app) {
      app.enabled = true;
      this.menus = this.buildMenusFromApps();
    }
  }
}

export default AppStore;
