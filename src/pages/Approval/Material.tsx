import React from 'react';
import { Descriptions } from 'antd';
import ApprovalListPage from './ApprovalListPage';
import { eligibilityApplicationService } from '@/services/domains/eligibility';
import { OT } from '@/services/ontology/object-types';
import type { EligibilityApplication } from '@/types/ontology/prh/entities/eligibility_application';
import { EnumLabels } from '@/utils/enum-options';

const ApprovalMaterial: React.FC = () => (
  <ApprovalListPage<EligibilityApplication & { id: string }>
    title="资格申请审批(材料初/复审)"
    objectType={OT.EligibilityApplication}
    service={eligibilityApplicationService as any}
    baseColumns={[
      { title: '编号', dataIndex: 'id', width: 200, render: (v: string) => `#${v.slice(-6)}` },
      { title: '申请人', dataIndex: 'applicant', width: 140 },
      { title: '家庭', dataIndex: 'household', width: 140 },
      {
        title: '类型',
        dataIndex: 'applicationType',
        width: 110,
        render: (v: any) =>
          EnumLabels.ApplicationType[v as keyof typeof EnumLabels.ApplicationType] ?? v,
      },
      {
        title: '提交时间',
        dataIndex: 'submittedAt',
        width: 200,
        render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
      },
    ]}
    renderDetail={(record) => (
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="编号">#{record.id.slice(-6)}</Descriptions.Item>
        <Descriptions.Item label="申请人">{String(record.applicant)}</Descriptions.Item>
        <Descriptions.Item label="家庭">{String(record.household)}</Descriptions.Item>
        <Descriptions.Item label="申请类型">
          {EnumLabels.ApplicationType[record.applicationType as keyof typeof EnumLabels.ApplicationType] ??
            (record.applicationType as any)}
        </Descriptions.Item>
        <Descriptions.Item label="提交时间">
          {record.submittedAt ? new Date(record.submittedAt as any).toLocaleString() : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          {EnumLabels.ApplicationStatus[record.status as keyof typeof EnumLabels.ApplicationStatus] ??
            record.status}
        </Descriptions.Item>
        <Descriptions.Item label="材料">
          {Array.isArray((record as any).materials)
            ? (record as any).materials.map((m: any) => m.type).join(', ')
            : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="审批意见">
          {(record as any).approvalOpinion ?? '-'}
        </Descriptions.Item>
      </Descriptions>
    )}
  />
);

export default ApprovalMaterial;
