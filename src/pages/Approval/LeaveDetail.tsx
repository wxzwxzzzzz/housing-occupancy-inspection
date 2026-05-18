import React from 'react';
import ApprovalDetailPage from './ApprovalDetailPage';
import { leaveService } from '@/services/domains/leave';
import { OT } from '@/services/ontology/object-types';
import type { Leave } from '@/types/ontology/prh/entities/leave';
import ResidentLink from '@/components/ResidentLink';

const LeaveDetail: React.FC = () => (
  <ApprovalDetailPage<Leave & { id: string }>
    objectType={OT.Leave}
    service={leaveService as any}
    titlePrefix="请假"
    listRoute="/approval/leave"
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
            label: '请假类型',
            value: String((record as any).leaveType ?? '-'),
            name: 'leaveType',
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
        key: 'reason',
        title: '事由与说明',
        defaultCollapsed: true,
        fields: [
          {
            label: '事由',
            value: (record as any).reason ?? '-',
            name: 'reason',
            editType: 'textarea',
          },
        ],
      },
    ]}
  />
);

export default LeaveDetail;
