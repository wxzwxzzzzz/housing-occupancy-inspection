import { makeAutoObservable, runInAction } from 'mobx';
import type { User } from '@/types/ontology/ap/arche/user';
import { authService, type AuthenticatedUser } from '@/services/domains/auth';
import { OntologyError } from '@/services/ontology/result';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const TENANT_KEY = 'tenant';

/** 前端态的当前用户 — 直接复用本体 User 类型 */
export type CurrentUser = User & {
  /** 由 authenticate 接口返回的 token,前端持久化 */
  token?: string;
  /** 当前租户标识 */
  tenant?: string;
};

class UserStore {
  user: CurrentUser | null = null;
  token: string | null = null;
  tenant: string = 'default';
  loading = false;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  get isLoggedIn(): boolean {
    return !!this.user && !!this.token;
  }

  /** 兼容旧调用 */
  get currentUser(): CurrentUser | null {
    return this.user;
  }

  /** 角色快捷判定:从 userType 派生 */
  get role(): string {
    return (this.user?.userType as string | undefined) ?? 'GUEST';
  }

  setUser(user: CurrentUser | null) {
    this.user = user;
    this.persist();
  }

  setToken(token: string | null) {
    this.token = token;
    this.persist();
  }

  setTenant(tenant: string) {
    this.tenant = tenant;
    this.persist();
  }

  async login(params: {
    account?: string;
    phone?: string;
    email?: string;
    password?: string;
    code?: string;
  }): Promise<{ ok: boolean; error?: OntologyError | Error }> {
    this.loading = true;
    try {
      const env = await authService.authenticate(params as any);
      const user = env.data as AuthenticatedUser | null;
      if (!user) {
        return { ok: false, error: new Error('登录失败') };
      }
      runInAction(() => {
        this.user = user;
        this.token = user.token ?? null;
        this.tenant = user.tenant ?? 'default';
        this.persist();
      });
      return { ok: true };
    } catch (err: any) {
      const error = err instanceof OntologyError ? err : new Error(err?.message ?? '登录失败');
      return { ok: false, error };
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  logout() {
    this.user = null;
    this.token = null;
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TENANT_KEY);
    } catch {}
  }

  /** 从 storage 拉取后,若 token 在但 user 缺失,回服 detail 兜底 */
  async fetchCurrentUser() {
    if (!this.token) return;
    if (this.user) return;
    try {
      const userId = (() => {
        try {
          return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')?.id as string | undefined;
        } catch {
          return undefined;
        }
      })();
      if (!userId) return;
      const env = await authService.currentUser(userId);
      runInAction(() => {
        if (env.data) {
          this.user = { ...(env.data as User), token: this.token ?? undefined };
          this.persist();
        }
      });
    } catch (err) {
      // 401 已在拦截器处理
      console.error('fetchCurrentUser failed', err);
    }
  }

  private persist() {
    try {
      if (this.user) localStorage.setItem(USER_KEY, JSON.stringify(this.user));
      if (this.token) localStorage.setItem(TOKEN_KEY, this.token);
      if (this.tenant) localStorage.setItem(TENANT_KEY, this.tenant);
    } catch {}
  }

  private loadFromStorage() {
    try {
      const u = localStorage.getItem(USER_KEY);
      const t = localStorage.getItem(TOKEN_KEY);
      const tenant = localStorage.getItem(TENANT_KEY);
      if (u) this.user = JSON.parse(u);
      if (t) this.token = t;
      if (tenant) this.tenant = tenant;
    } catch (err) {
      console.error('Failed to load user from storage:', err);
      this.logout();
    }
  }
}

export default UserStore;
