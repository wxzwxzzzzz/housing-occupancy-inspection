import React from 'react';
import ApplicationDetailPage from '@/components/ApplicationDetailPage';
import AttachmentTab from '@/components/AttachmentTab';
import ResidentLink from '@/components/ResidentLink';
import { leaveAttachmentService, leaveService } from '@/services/domains/leave';
import { OT } from '@/services/ontology/object-types';
import type { Leave } from '@/types/ontology/prh/entities/leave';

const LeaveDetail: React.FC = () => (
  <ApplicationDetailPage<Leave>
    title="请假申请"
    objectType={OT.Leave}
    service={leaveService as any}
    listPath="/monitor/leaves"
    buildSections={(r) => [
      {
        key: 'base',
        title: '请假信息',
        fields: [
          {
            label: '请假居民',
            value: r.resident ? (
              <ResidentLink id={String(r.resident)}>
                {String(r.resident)}
              </ResidentLink>
            ) : (
              '-'
            ),
          },
          {
            label: '请假类型',
            value: r.leaveType ? `#${String(r.leaveType).slice(-6)}` : '-',
          },
          { label: '开始日期', value: r.startDate ?? '-' },
          { label: '结束日期', value: r.endDate ?? '-' },
          { label: '请假原因', value: r.reason ?? '-' },
        ],
      },
    ]}
    buildTabs={(r) => [
      {
        key: 'attachments',
        label: '附件',
        content: (
          <AttachmentTab
            service={leaveAttachmentService as any}
            ownerField="leave"
            ownerId={r.id}
            readonly={r.status !== 'DRAFT' && r.status !== 'UNDER_APPROVAL'}
          />
        ),
      },
    ]}
  />
);

export default LeaveDetail;
