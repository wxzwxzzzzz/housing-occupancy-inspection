/**
 * 家庭/家庭成员/居住/就业/收入 — 偏静态档案的实体
 */

import { buildEntityApi } from '../ontology/crud';
import { OT } from '../ontology/object-types';
import type { Household } from '@/types/ontology/prh/entities/household';
import type { HouseholdMember } from '@/types/ontology/prh/entities/household_member';
import type { Residence } from '@/types/ontology/prh/entities/residence';
import type { Employment } from '@/types/ontology/prh/entities/employment';
import type { PersonalIncome } from '@/types/ontology/prh/entities/personal_income';

export const householdService = buildEntityApi<Household>(OT.Household);
export const householdMemberService = buildEntityApi<HouseholdMember>(OT.HouseholdMember);
export const residenceService = buildEntityApi<Residence>(OT.Residence);
export const employmentService = buildEntityApi<Employment>(OT.Employment);
export const personalIncomeService = buildEntityApi<PersonalIncome>(OT.PersonalIncome);
