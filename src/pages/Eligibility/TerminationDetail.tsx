import React from 'react';
import ApplicationDetailPage from '@/components/ApplicationDetailPage';
import { eligibilityTerminationService } from '@/services/domains/eligibility';
import { OT } from '@/services/ontology/object-types';
import { dictLabel } from '@/stores/dictStore';
import type { EligibilityTermination } from '@/types/ontology/prh/entities/eligibility_termination';

const EligibilityTerminationDetail: React.FC = () => (
  <ApplicationDetailPage<EligibilityTermination>
    title="资格终止申请"
    objectType={OT.EligibilityTermination}
    service={eligibilityTerminationService as any}
    listPath="/eligibility/terminations"
    buildSections={(r) => [
      {
        key: 'base',
        title: '终止信息',
        fields: [
          {
            label: '所属家庭',
            value: r.household ? `家庭#${String(r.household).slice(-6)}` : '-',
          },
          {
            label: '终止类型',
            value: dictLabel('TerminationReason', r.terminationType),
          },
          { label: '期望生效日期', value: r.effectiveDate ?? '-' },
          { label: '终止原因', value: r.reason ?? '-' },
        ],
      },
    ]}
  />
);

export default EligibilityTerminationDetail;
