/**
 * 变更类实体服务 — 居住变更 / 就业变更 / 家庭成员变更
 *
 * 三者都混入 IApprovalFlow,可走通用 approve/reject。
 */

import { buildEntityApi } from '../ontology/crud';
import { OT } from '../ontology/object-types';
import type { ResidenceChange } from '@/types/ontology/prh/entities/residence_change';
import type { EmploymentChange } from '@/types/ontology/prh/entities/employment_change';
import type { HouseholdMemberChange } from '@/types/ontology/prh/entities/household_member_change';

export const residenceChangeService = buildEntityApi<ResidenceChange>(OT.ResidenceChange);
export const employmentChangeService = buildEntityApi<EmploymentChange>(OT.EmploymentChange);
export const householdMemberChangeService = buildEntityApi<HouseholdMemberChange>(
  OT.HouseholdMemberChange,
);
