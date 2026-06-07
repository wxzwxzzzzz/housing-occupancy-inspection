import React from 'react';
import ApplicationDetailPage from '@/components/ApplicationDetailPage';
import ResidentLink from '@/components/ResidentLink';
import { employmentChangeService } from '@/services/domains/change';
import { OT } from '@/services/ontology/object-types';
import type { EmploymentChange } from '@/types/ontology/prh/entities/employment_change';

const EmploymentChangeDetail: React.FC = () => (
  <ApplicationDetailPage<EmploymentChange>
    title="工作地址变更"
    objectType={OT.EmploymentChange}
    service={employmentChangeService as any}
    listPath="/monitor/employment-changes"
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
          { label: '工作单位', value: r.company ?? '-' },
          {
            label: '工作地址',
            value: (r.companyAddress as any)?.detail ?? '-',
          },
          { label: '单位联系人', value: r.companyContract ?? '-' },
          { label: '联系电话', value: r.companyContractPhone ?? '-' },
          { label: '变更原因', value: r.reason ?? '-' },
        ],
      },
    ]}
  />
);

export default EmploymentChangeDetail;
