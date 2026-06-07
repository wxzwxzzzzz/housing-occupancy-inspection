import React from 'react';
import ApplicationDetailPage from '@/components/ApplicationDetailPage';
import ResidentLink from '@/components/ResidentLink';
import { attendanceMakeupService } from '@/services/domains/attendance';
import { OT } from '@/services/ontology/object-types';
import type { AttendanceMakeup } from '@/types/ontology/prh/entities/attendance_makeup';

const MakeupDetail: React.FC = () => (
  <ApplicationDetailPage<AttendanceMakeup>
    title="补卡申请"
    objectType={OT.AttendanceMakeup}
    service={attendanceMakeupService as any}
    listPath="/monitor/makeups"
    hideTabs
    buildSections={(r) => [
      {
        key: 'base',
        title: '补卡信息',
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
          {
            label: '关联打卡',
            value: r.targetAttendance
              ? `#${String(r.targetAttendance).slice(-6)}`
              : '-',
          },
          { label: '补卡原因', value: r.reason ?? '-' },
        ],
      },
    ]}
  />
);

export default MakeupDetail;
