/**
 * 天地图(TianDiTu)加载工具
 *
 * 使用要求:用户需到 https://console.tianditu.gov.cn/api/key 申请开发者 token,
 * 持久化到 localStorage('tianditu_token'),也可在 .env 中预置 TIANDITU_TOKEN。
 *
 * loadTianDiTu() 会幂等地动态注入 <script>,加载完后返回全局 window.T。
 */

const TOKEN_STORAGE_KEY = 'tianditu_token';

declare global {
  interface Window {
    T?: any;
    /** Umi 注入 process.env */
    __TIANDITU_LOAD_PROMISE__?: Promise<any>;
  }
}

export function getTianDiTuToken(): string {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setTianDiTuToken(token: string) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {}
}

/**
 * 动态加载天地图 JS API
 * 文档:http://lbs.tianditu.gov.cn/api/js4.0/guide.html
 */
export function loadTianDiTu(token?: string): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('SSR 环境不支持加载地图'));
  }
  if (window.T) return Promise.resolve(window.T);
  if (window.__TIANDITU_LOAD_PROMISE__) return window.__TIANDITU_LOAD_PROMISE__;

  const tk = token ?? getTianDiTuToken();
  if (!tk) {
    return Promise.reject(
      new Error('未配置天地图 token,请先到「电子围栏」页面填写 token'),
    );
  }

  window.__TIANDITU_LOAD_PROMISE__ = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${encodeURIComponent(tk)}`;
    script.async = true;
    script.onload = () => {
      if (window.T) resolve(window.T);
      else reject(new Error('天地图加载完成但 window.T 未注入,请检查 token 是否有效'));
    };
    script.onerror = () => reject(new Error('天地图脚本加载失败,请检查网络或 token'));
    document.head.appendChild(script);
  });

  return window.__TIANDITU_LOAD_PROMISE__;
}
