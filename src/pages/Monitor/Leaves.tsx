import React, { useState } from 'react';
import ApplicationListPage from '@/components/ApplicationListPage';
import EntityCreateModal from '@/components/EntityCreateModal';
import ResidentLink from '@/components/ResidentLink';
import { leaveService } from '@/services/domains/leave';
import { OT } from '@/services/ontology/object-types';
import type { Leave } from '@/types/ontology/prh/entities/leave';

const MonitorLeaves: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);

  return (
    <>
      <ApplicationListPage<Leave & { id: string }>
        key={reloadFlag}
        title="请假申请"
        objectType={OT.Leave}
        service={leaveService as any}
        detailRoute="/monitor/leaves/detail"
        allowCreate
        onCreate={() => setCreateOpen(true)}
        baseColumns={[
          {
            title: '编号',
            dataIndex: 'id',
            width: 110,
            render: (v: string) => `#${v.slice(-6)}`,
          },
          {
            title: '居民',
            dataIndex: 'resident',
            width: 130,
            render: (v: string) =>
              v ? <ResidentLink id={String(v)}>{String(v)}</ResidentLink> : '-',
          },
          {
            title: '请假类型',
            dataIndex: 'leaveType',
            width: 130,
            render: (v: string) => (v ? `#${String(v).slice(-6)}` : '-'),
          },
          { title: '开始日期', dataIndex: 'startDate', width: 120 },
          { title: '结束日期', dataIndex: 'endDate', width: 120 },
          { title: '请假原因', dataIndex: 'reason', ellipsis: true },
        ]}
      />
      <EntityCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => setReloadFlag((v) => v + 1)}
        title="新建请假申请"
        service={leaveService as any}
        fields={[
          {
            name: 'resident',
            label: '请假居民',
            type: 'refer',
            required: true,
            referObjectType: OT.Resident,
            referLabelField: 'fullName',
            referExtraFilter: (b) => b.eq('status', 'ACTIVATED'),
            span: 2,
          },
          {
            name: 'leaveType',
            label: '请假类型',
            type: 'refer',
            required: true,
            referObjectType: OT.LeaveType,
            referLabelField: 'name',
            referExtraFilter: (b) => b.eq('enable', 'true'),
          },
          {
            name: 'startDate',
            label: '开始日期',
            type: 'date',
            required: true,
          },
          { name: 'endDate', label: '结束日期', type: 'date', required: true },
          { name: 'reason', label: '请假原因', type: 'textarea', span: 2 },
        ]}
      />
    </>
  );
};

export default MonitorLeaves;
