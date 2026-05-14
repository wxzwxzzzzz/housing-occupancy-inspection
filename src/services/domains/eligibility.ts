/**
 * 资格相关服务 — 申请 / 终止 / 房屋分配 / 租赁补贴
 */

import { buildEntityApi } from '../ontology/crud';
import { OT } from '../ontology/object-types';
import type { EligibilityApplication } from '@/types/ontology/prh/entities/eligibility_application';
import type { EligibilityTermination } from '@/types/ontology/prh/entities/eligibility_termination';
import type { HousingAllocation } from '@/types/ontology/prh/entities/housing_allocation';
import type { RentalSubsidy } from '@/types/ontology/prh/entities/rental_subsidy';

export const eligibilityApplicationService = buildEntityApi<EligibilityApplication>(
  OT.EligibilityApplication,
);
export const eligibilityTerminationService = buildEntityApi<EligibilityTermination>(
  OT.EligibilityTermination,
);
export const housingAllocationService = buildEntityApi<HousingAllocation>(OT.HousingAllocation);
export const rentalSubsidyService = buildEntityApi<RentalSubsidy>(OT.RentalSubsidy);
