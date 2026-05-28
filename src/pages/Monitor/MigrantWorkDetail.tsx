import React from 'react';
import ApplicationDetailPage from '@/components/ApplicationDetailPage';
import ResidentLink from '@/components/ResidentLink';
import { migrantWorkService } from '@/services/domains/migrant-work';
import { OT } from '@/services/ontology/object-types';
import type { MigrantWork } from '@/types/ontology/prh/entities/migrant_work';

const MigrantWorkDetail: React.FC = () => (
  <ApplicationDetailPage<MigrantWork>
    title="外出务工申请"
    objectType={OT.MigrantWork}
    service={migrantWorkService as any}
    listPath="/monitor/migrant-works"
    buildSections={(r) => [
      {
        key: 'base',
        title: '基本信息',
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
          { label: '开始日期', value: r.startDate ?? '-' },
          { label: '结束日期', value: r.endDate ?? '-' },
          { label: '外出原因', value: r.reason ?? '-' },
        ],
      },
      {
        key: 'addresses',
        title: '地址信息',
        fields: [
          {
            label: '务工居住地址',
            value: (r.residentAddress as any)?.detail ?? '-',
          },
          {
            label: '工作地址',
            value: (r.companyAddress as any)?.detail ?? '-',
          },
        ],
      },
      {
        key: 'company',
        title: '工作单位',
        defaultCollapsed: true,
        fields: [
          { label: '务工单位', value: r.company ?? '-' },
          { label: '单位联系人', value: r.companyContract ?? '-' },
          { label: '联系电话', value: r.companyContractPhone ?? '-' },
        ],
      },
    ]}
  />
);

export default MigrantWorkDetail;
