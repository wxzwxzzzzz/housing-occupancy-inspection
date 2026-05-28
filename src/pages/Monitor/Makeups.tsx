import React, { useState } from 'react';
import ApplicationListPage from '@/components/ApplicationListPage';
import EntityCreateModal from '@/components/EntityCreateModal';
import ResidentLink from '@/components/ResidentLink';
import { attendanceMakeupService } from '@/services/domains/attendance';
import { OT } from '@/services/ontology/object-types';
import type { AttendanceMakeup } from '@/types/ontology/prh/entities/attendance_makeup';

const MonitorMakeups: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);

  return (
    <>
      <ApplicationListPage<AttendanceMakeup & { id: string }>
        key={reloadFlag}
        title="补卡申请"
        objectType={OT.AttendanceMakeup}
        service={attendanceMakeupService as any}
        detailRoute="/monitor/makeups/detail"
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
            title: '申请居民',
            dataIndex: 'resident',
            width: 130,
            render: (v: string) =>
              v ? <ResidentLink id={String(v)}>{String(v)}</ResidentLink> : '-',
          },
          {
            title: '关联打卡',
            dataIndex: 'targetAttendance',
            width: 130,
            render: (v: string) => (v ? `#${String(v).slice(-6)}` : '-'),
          },
          { title: '补卡原因', dataIndex: 'reason', ellipsis: true },
        ]}
      />
      <EntityCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => setReloadFlag((v) => v + 1)}
        title="新建补卡申请"
        service={attendanceMakeupService as any}
        fields={[
          {
            name: 'resident',
            label: '申请居民',
            type: 'refer',
            required: true,
            referObjectType: OT.Resident,
            referLabelField: 'fullName',
            referExtraFilter: (b) => b.eq('status', 'ACTIVATED'),
            span: 2,
          },
          {
            name: 'targetAttendance',
            label: '关联打卡',
            type: 'refer',
            required: true,
            referObjectType: OT.Attendance,
            referLabelField: 'id',
            referSearchField: 'id',
            extra: '只能选择"缺勤"或"无效"的打卡记录',
            referExtraFilter: (b) => b.in('status', ['MISSED', 'INVALID']),
            span: 2,
          },
          {
            name: 'reason',
            label: '补卡原因',
            type: 'textarea',
            required: true,
            span: 2,
          },
        ]}
      />
    </>
  );
};

export default MonitorMakeups;
