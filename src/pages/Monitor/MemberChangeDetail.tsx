import React from 'react';
import ApplicationDetailPage from '@/components/ApplicationDetailPage';
import { householdMemberChangeService } from '@/services/domains/change';
import { OT } from '@/services/ontology/object-types';
import { dictLabel } from '@/stores/dictStore';
import type { HouseholdMemberChange } from '@/types/ontology/prh/entities/household_member_change';
import {
  FamilyEmploymentsTab,
  FamilyIncomesTab,
  FamilyMembersTab,
  FamilyResidencesTab,
} from '@/pages/Eligibility/ApplicationFamilyTabs';

const MemberChangeDetail: React.FC = () => (
  <ApplicationDetailPage<HouseholdMemberChange>
    title="家庭成员变更"
    objectType={OT.HouseholdMemberChange}
    service={householdMemberChangeService as any}
    listPath="/monitor/member-changes"
    buildSections={(r) => [
      {
        key: 'base',
        title: '变更信息',
        fields: [
          {
            label: '所属家庭',
            value: r.household ? `家庭#${String(r.household).slice(-6)}` : '-',
          },
          {
            label: '变更类型',
            value: dictLabel('MemberChangeType', r.changeType),
          },
          {
            label: '目标成员',
            value: r.member ? `成员#${String(r.member).slice(-6)}` : '-',
          },
          { label: '变更原因', value: r.reason ?? '-' },
        ],
      },
    ]}
    buildTabs={(r) => {
      const householdId = r.household ? String(r.household) : undefined;
      return [
        {
          key: 'members',
          label: '家庭成员',
          content: <FamilyMembersTab householdId={householdId} />,
        },
        {
          key: 'residences',
          label: '居住信息',
          content: <FamilyResidencesTab householdId={householdId} />,
        },
        {
          key: 'employments',
          label: '工作信息',
          content: <FamilyEmploymentsTab householdId={householdId} />,
        },
        {
          key: 'incomes',
          label: '个人收入',
          content: <FamilyIncomesTab householdId={householdId} />,
        },
      ];
    }}
  />
);

export default MemberChangeDetail;
