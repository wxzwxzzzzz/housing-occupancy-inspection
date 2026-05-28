import React from 'react';
import ApplicationDetailPage from '@/components/ApplicationDetailPage';
import { householdMemberChangeService } from '@/services/domains/change';
import { OT } from '@/services/ontology/object-types';
import { dictLabel } from '@/stores/dictStore';
import type { HouseholdMemberChange } from '@/types/ontology/prh/entities/household_member_change';

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
  />
);

export default MemberChangeDetail;
