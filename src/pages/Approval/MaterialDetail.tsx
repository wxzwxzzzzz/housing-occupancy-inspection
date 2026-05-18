import React from 'react';
import ApprovalDetailPage from './ApprovalDetailPage';
import { eligibilityApplicationService } from '@/services/domains/eligibility';
import { OT } from '@/services/ontology/object-types';
import type { EligibilityApplication } from '@/types/ontology/prh/entities/eligibility_application';
import { EnumLabels } from '@/utils/enum-options';
import ResidentLink from '@/components/ResidentLink';

const MaterialDetail: React.FC = () => (
  <ApprovalDetailPage<EligibilityApplication & { id: string }>
    objectType={OT.EligibilityApplication}
    service={eligibilityApplicationService as any}
    titlePrefix="资格申请"
    listRoute="/approval/material"
    buildSections={(record) => [
      {
        key: 'base',
        title: '基础信息',
        fields: [
          { label: '编号', value: `#${record.id.slice(-6)}` },
          {
            label: '申请人',
            value: (record as any).applicant ? (
              <ResidentLink id={String((record as any).applicant)} />
            ) : (
              '-'
            ),
            name: 'applicant',
            editType: 'input',
          },
          {
            label: '家庭',
            value: String((record as any).household ?? '-'),
            name: 'household',
            editType: 'input',
          },
          {
            label: '申请类型',
            value:
              EnumLabels.ApplicationType[
                (record as any).applicationType as keyof typeof EnumLabels.ApplicationType
              ] ?? (record as any).applicationType,
            name: 'applicationType',
            editType: 'select',
            options: Object.entries(EnumLabels.ApplicationType).map(([value, label]) => ({
              value,
              label,
            })),
          },
          {
            label: '材料',
            value: Array.isArray((record as any).materials)
              ? (record as any).materials.map((m: any) => m.type).join(', ')
              : '-',
          },
        ],
      },
    ]}
  />
);

export default MaterialDetail;
