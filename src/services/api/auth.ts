import { request } from '@umijs/max';

/**
 * 登录接口参数
 */
export interface LoginParams {
  username?: string;
  password?: string;
  phone?: string;
  code?: string;
  type: 'account' | 'phone';
}

/**
 * 登录响应
 */
export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      name: string;
      role: string;
      permissions: string[];
      phone?: string;
      email?: string;
      avatar?: string;
    };
  };
  message?: string;
}

/**
 * 发送验证码参数
 */
export interface SendSmsParams {
  phone: string;
  scene: 'login' | 'register' | 'reset';
}

/**
 * 账号密码登录
 */
export async function accountLogin(params: {
  username: string;
  password: string;
}): Promise<LoginResponse> {
  return request('/api/auth/login', {
    method: 'POST',
    data: params,
  });
}

/**
 * 手机号验证码登录
 */
export async function phoneLogin(params: {
  phone: string;
  code: string;
}): Promise<LoginResponse> {
  return request('/api/auth/phone-login', {
    method: 'POST',
    data: params,
  });
}

/**
 * 发送短信验证码
 */
export async function sendSmsCode(params: SendSmsParams): Promise<{
  success: boolean;
  message?: string;
}> {
  return request('/api/auth/send-sms', {
    method: 'POST',
    data: params,
  });
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<{
  success: boolean;
  data: any;
}> {
  return request('/api/auth/current-user', {
    method: 'GET',
  });
}

/**
 * 退出登录
 */
export async function logout(): Promise<{
  success: boolean;
}> {
  return request('/api/auth/logout', {
    method: 'POST',
  });
}

/**
 * 刷新 Token
 */
export async function refreshToken(): Promise<{
  success: boolean;
  data: {
    token: string;
  };
}> {
  return request('/api/auth/refresh-token', {
    method: 'POST',
  });
}
