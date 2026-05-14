import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { message, notification } from 'antd';
import { OntologyError } from './services/ontology/result';

enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

const TOKEN_KEY = 'token';
const LOGIN_PATH = '/login';

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function clearAuthAndRedirect() {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
  if (history.location.pathname !== LOGIN_PATH) {
    history.replace(LOGIN_PATH);
  }
}

export const errorConfig: RequestConfig = {
  errorConfig: {
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error;
      }
    },
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;

      // 本体调用专属错误:展示首条 fieldError 或 message
      if (error?.name === 'OntologyError' || error instanceof OntologyError) {
        const ontErr = error as OntologyError;
        const msg = ontErr.firstFieldError ?? ontErr.message ?? '操作失败';
        message.error(msg);
        return;
      }

      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              clearAuthAndRedirect();
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          message.warning('登录已失效,请重新登录');
          clearAuthAndRedirect();
          return;
        }
        if (status === 403) {
          message.error('无权访问该资源');
          return;
        }
        message.error(`Response status: ${status}`);
      } else if (error.request) {
        message.error('网络无响应,请重试');
      } else {
        message.error('请求出错,请重试');
      }
    },
  },

  requestInterceptors: [
    (config: RequestOptions) => {
      const token = getToken();
      const headers = { ...(config.headers ?? {}) } as Record<string, string>;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return { ...config, headers };
    },
  ],

  responseInterceptors: [
    (response) => {
      const { data } = response as unknown as { data: ResponseStructure };
      // 本体的 success=false 由各业务 catch OntologyError 处理,此处不重复弹
      if (data?.success === false && !('code' in (data as any))) {
        message.error('请求失败');
      }
      return response;
    },
  ],
};
