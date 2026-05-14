/**
 * 认证服务
 *
 * User 在 ap/arche 域,自定义动作 authenticate / signup / activate / lockAccount。
 */

import { invokeAction, invokeSingle } from '../ontology/client';
import { OT } from '../ontology/object-types';
import type { User } from '@/types/ontology/ap/arche/user';

export type AuthenticateParams =
  | { account: string; password: string }
  | { phone: string; password?: string; code?: string }
  | { email: string; password: string };

export interface AuthenticatedUser extends User {
  token: string;
  tenant?: string;
}

export const authService = {
  authenticate(params: AuthenticateParams) {
    return invokeSingle<AuthenticatedUser>(
      {
        objectType: OT.User,
        actionName: 'authenticate',
        payload: params as Record<string, unknown>,
      },
      { silent: true },
    );
  },

  signup(params: {
    account: string;
    password: string;
    phone?: string;
    email?: string;
    fullName?: string;
  }) {
    return invokeSingle<User>(
      { objectType: OT.User, actionName: 'signup', payload: params },
      { silent: true },
    );
  },

  activate(id: string) {
    return invokeAction<User>({
      objectType: OT.User,
      actionName: 'activate',
      payload: { id },
    });
  },

  lockAccount(id: string, until?: string) {
    return invokeAction<User>({
      objectType: OT.User,
      actionName: 'lockAccount',
      payload: { id, until },
    });
  },

  unlockAccount(id: string) {
    return invokeAction<User>({
      objectType: OT.User,
      actionName: 'unlockAccount',
      payload: { id },
    });
  },

  /** 拉当前用户:本体规范走 detail by id,后端通常用 token 解析自身 id */
  currentUser(id: string) {
    return invokeSingle<User>({
      objectType: OT.User,
      actionName: 'detail',
      payload: { id },
    });
  },
};
