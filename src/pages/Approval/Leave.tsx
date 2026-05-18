import React from 'react';
import ApprovalListPage from './ApprovalListPage';
import { leaveService } from '@/services/domains/leave';
import { OT } from '@/services/ontology/object-types';
import type { Leave } from '@/types/ontology/prh/entities/leave';
import ResidentLink from '@/components/ResidentLink';

const ApprovalLeave: React.FC = () => (
  <ApprovalListPage<Leave & { id: string }>
    title="请假审批"
    objectType={OT.Leave}
    service={leaveService as any}
    detailRoute="/approval/leave/detail"
    baseColumns={[
      { title: '编号', dataIndex: 'id', width: 110, render: (v: string) => `#${v.slice(-6)}` },
      {
        title: '居民',
        dataIndex: 'resident',
        width: 130,
        render: (v: string) => (v ? <ResidentLink id={String(v)}>{String(v)}</ResidentLink> : '-'),
      },
      { title: '请假类型', dataIndex: 'leaveType', width: 110 },
      { title: '开始日期', dataIndex: 'startDate', width: 120 },
      { title: '结束日期', dataIndex: 'endDate', width: 120 },
    ]}
  />
);

export default ApprovalLeave;
