/**
 * 事实表统一查询入口 — 17 个 Fact
 *
 * 业务上 Fact 只读(报表用),所以这里只暴露 list。
 */

import { buildEntityApi } from '../ontology/crud';
import { OT } from '../ontology/object-types';
import type { AttendanceFact } from '@/types/ontology/prh/facts/attendance_fact';
import type { AttendanceMakeupFact } from '@/types/ontology/prh/facts/attendance_makeup_fact';
import type { EligibilityApplicationFact } from '@/types/ontology/prh/facts/eligibility_application_fact';
import type { EligibilityTerminationFact } from '@/types/ontology/prh/facts/eligibility_termination_fact';
import type { EmploymentChangeFact } from '@/types/ontology/prh/facts/employment_change_fact';
import type { EmploymentSnapshotFact } from '@/types/ontology/prh/facts/employment_snapshot_fact';
import type { HouseholdMemberChangeFact } from '@/types/ontology/prh/facts/household_member_change_fact';
import type { HouseholdMemberSnapshotFact } from '@/types/ontology/prh/facts/household_member_snapshot_fact';
import type { HouseholdSnapshotFact } from '@/types/ontology/prh/facts/household_snapshot_fact';
import type { HousingAllocationFact } from '@/types/ontology/prh/facts/housing_allocation_fact';
import type { LeaveFact } from '@/types/ontology/prh/facts/leave_fact';
import type { MigrantWorkFact } from '@/types/ontology/prh/facts/migrant_work_fact';
import type { PersonalIncomeFact } from '@/types/ontology/prh/facts/personal_income_fact';
import type { RentalSubsidyFact } from '@/types/ontology/prh/facts/rental_subsidy_fact';
import type { ResidenceChangeFact } from '@/types/ontology/prh/facts/residence_change_fact';
import type { ResidenceSnapshotFact } from '@/types/ontology/prh/facts/residence_snapshot_fact';
import type { ResidentSnapshotFact } from '@/types/ontology/prh/facts/resident_snapshot_fact';

const opt = { withoutLogicDelete: true };

export const factService = {
  attendance: buildEntityApi<AttendanceFact>(OT.AttendanceFact, opt),
  attendanceMakeup: buildEntityApi<AttendanceMakeupFact>(OT.AttendanceMakeupFact, opt),
  eligibilityApplication: buildEntityApi<EligibilityApplicationFact>(
    OT.EligibilityApplicationFact,
    opt,
  ),
  eligibilityTermination: buildEntityApi<EligibilityTerminationFact>(
    OT.EligibilityTerminationFact,
    opt,
  ),
  employmentChange: buildEntityApi<EmploymentChangeFact>(OT.EmploymentChangeFact, opt),
  employmentSnapshot: buildEntityApi<EmploymentSnapshotFact>(OT.EmploymentSnapshotFact, opt),
  householdMemberChange: buildEntityApi<HouseholdMemberChangeFact>(
    OT.HouseholdMemberChangeFact,
    opt,
  ),
  householdMemberSnapshot: buildEntityApi<HouseholdMemberSnapshotFact>(
    OT.HouseholdMemberSnapshotFact,
    opt,
  ),
  householdSnapshot: buildEntityApi<HouseholdSnapshotFact>(OT.HouseholdSnapshotFact, opt),
  housingAllocation: buildEntityApi<HousingAllocationFact>(OT.HousingAllocationFact, opt),
  leave: buildEntityApi<LeaveFact>(OT.LeaveFact, opt),
  migrantWork: buildEntityApi<MigrantWorkFact>(OT.MigrantWorkFact, opt),
  personalIncome: buildEntityApi<PersonalIncomeFact>(OT.PersonalIncomeFact, opt),
  rentalSubsidy: buildEntityApi<RentalSubsidyFact>(OT.RentalSubsidyFact, opt),
  residenceChange: buildEntityApi<ResidenceChangeFact>(OT.ResidenceChangeFact, opt),
  residenceSnapshot: buildEntityApi<ResidenceSnapshotFact>(OT.ResidenceSnapshotFact, opt),
  residentSnapshot: buildEntityApi<ResidentSnapshotFact>(OT.ResidentSnapshotFact, opt),
};
