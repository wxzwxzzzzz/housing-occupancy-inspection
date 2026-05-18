import React from 'react';
import ApprovalListPage from './ApprovalListPage';
import { eligibilityApplicationService } from '@/services/domains/eligibility';
import { OT } from '@/services/ontology/object-types';
import type { EligibilityApplication } from '@/types/ontology/prh/entities/eligibility_application';
import { EnumLabels } from '@/utils/enum-options';
import ResidentLink from '@/components/ResidentLink';

const ApprovalMaterial: React.FC = () => (
  <ApprovalListPage<EligibilityApplication & { id: string; resident?: string }>
    title="资格申请审批"
    objectType={OT.EligibilityApplication}
    service={eligibilityApplicationService as any}
    detailRoute="/approval/material/detail"
    baseColumns={[
      { title: '编号', dataIndex: 'id', width: 110, render: (v: string) => `#${v.slice(-6)}` },
      {
        title: '申请人',
        dataIndex: 'applicant',
        width: 140,
        render: (v: string) => (v ? <ResidentLink id={String(v)}>{String(v)}</ResidentLink> : '-'),
      },
      {
        title: '类型',
        dataIndex: 'applicationType',
        width: 120,
        render: (v: any) =>
          EnumLabels.ApplicationType[v as keyof typeof EnumLabels.ApplicationType] ?? v,
      },
      {
        title: '提交时间',
        dataIndex: 'submittedAt',
        width: 180,
        render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
      },
    ]}
  />
);

export default ApprovalMaterial;
