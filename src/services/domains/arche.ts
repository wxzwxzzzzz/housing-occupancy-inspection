/**
 * 系统启元域 — User / Tenant / Enterprise
 *
 * User CRUD 用于"人员管理"页;authenticate 在 auth.ts。
 */

import { buildEntityApi } from '../ontology/crud';
import { OT } from '../ontology/object-types';
import type { User } from '@/types/ontology/ap/arche/user';
import type { Tenant } from '@/types/ontology/ap/arche/tenant';
import type { Enterprise } from '@/types/ontology/ap/arche/enterprise';

export const userService = buildEntityApi<User>(OT.User, { withoutLogicDelete: true });
export const tenantService = buildEntityApi<Tenant>(OT.Tenant, { withoutLogicDelete: true });
export const enterpriseService = buildEntityApi<Enterprise>(OT.Enterprise, {
  withoutLogicDelete: true,
});
