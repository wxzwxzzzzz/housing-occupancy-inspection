import React from 'react';
import ApplicationDetailPage from '@/components/ApplicationDetailPage';
import ResidentLink from '@/components/ResidentLink';
import { residenceChangeService } from '@/services/domains/change';
import { OT } from '@/services/ontology/object-types';
import type { ResidenceChange } from '@/types/ontology/prh/entities/residence_change';

const ResidenceChangeDetail: React.FC = () => (
  <ApplicationDetailPage<ResidenceChange>
    title="居住地址变更"
    objectType={OT.ResidenceChange}
    service={residenceChangeService as any}
    listPath="/monitor/residence-changes"
    hideTabs
    buildSections={(r) => [
      {
        key: 'base',
        title: '变更信息',
        fields: [
          {
            label: '申请居民',
            value: r.resident ? (
              <ResidentLink id={String(r.resident)}>
                {String(r.resident)}
              </ResidentLink>
            ) : (
              '-'
            ),
          },
          {
            label: '新居住地址',
            value: (r.address as any)?.detail ?? '-',
          },
          { label: '变更原因', value: r.reason ?? '-' },
        ],
      },
    ]}
  />
);

export default ResidenceChangeDetail;
