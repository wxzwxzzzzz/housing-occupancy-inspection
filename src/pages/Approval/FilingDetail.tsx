import React from 'react';
import ApprovalDetailPage from './ApprovalDetailPage';
import { migrantWorkService } from '@/services/domains/migrant-work';
import { OT } from '@/services/ontology/object-types';
import type { MigrantWork } from '@/types/ontology/prh/entities/migrant_work';
import ResidentLink from '@/components/ResidentLink';

const FilingDetail: React.FC = () => (
  <ApprovalDetailPage<MigrantWork & { id: string }>
    objectType={OT.MigrantWork}
    service={migrantWorkService as any}
    titlePrefix="备案"
    listRoute="/approval/filing"
    buildSections={(record) => [
      {
        key: 'base',
        title: '基础信息',
        fields: [
          { label: '编号', value: `#${record.id.slice(-6)}` },
          {
            label: '居民',
            value: (record as any).resident ? (
              <ResidentLink id={String((record as any).resident)} />
            ) : (
              '-'
            ),
            name: 'resident',
            editType: 'input',
          },
          {
            label: '备案类型',
            value: String((record as any).type ?? '-'),
            name: 'type',
            editType: 'input',
          },
          {
            label: '开始日期',
            value: String((record as any).startDate ?? '-'),
            name: 'startDate',
            editType: 'date',
          },
          {
            label: '结束日期',
            value: String((record as any).endDate ?? '-'),
            name: 'endDate',
            editType: 'date',
          },
        ],
      },
      {
        key: 'dest',
        title: '目的地与单位',
        defaultCollapsed: true,
        fields: [
          {
            label: '工作单位',
            value: (record as any).employerName ?? '-',
            name: 'employerName',
            editType: 'input',
          },
          {
            label: '事由',
            value: (record as any).reason ?? '-',
            name: 'reason',
            editType: 'textarea',
          },
          {
            label: '目的地址',
            value: (record as any).destAddress?.detail ?? '-',
          },
          {
            label: '坐标',
            value: (record as any).destAddress?.geoPoint
              ? `${(record as any).destAddress.geoPoint.longitude}, ${(record as any).destAddress.geoPoint.latitude}`
              : '-',
          },
        ],
      },
    ]}
  />
);

export default FilingDetail;
