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

class AppStore {
  primaryColor: string = '#1890ff';
  loading: boolean = false;
  collapsed: boolean = false;
  apps: AppItem[] = [];
  menus: MenuItem[] = [];

  constructor() {
    makeAutoObservable(this);
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
  }

  setApps(apps: AppItem[]) {
    this.apps = apps;
  }

  setMenus(menus: MenuItem[]) {
    this.menus = menus;
  }

  buildMenusFromApps(): MenuItem[] {
    return this.apps
      .filter(app => app.enabled)
      .map(app => ({
        path: app.route,
        name: app.name,
        icon: app.icon,
      }));
  }

  disableApp(appId: string) {
    const app = this.apps.find(a => a.id === appId);
    if (app) {
      app.enabled = false;
      this.menus = this.buildMenusFromApps();
    }
  }

  enableApp(appId: string) {
    const app = this.apps.find(a => a.id === appId);
    if (app) {
      app.enabled = true;
      this.menus = this.buildMenusFromApps();
    }
  }
}

export default AppStore;
