import React from 'react';
import { Descriptions } from 'antd';
import ApprovalListPage from './ApprovalListPage';
import { leaveService } from '@/services/domains/leave';
import { OT } from '@/services/ontology/object-types';
import type { Leave } from '@/types/ontology/prh/entities/leave';
import { EnumLabels } from '@/utils/enum-options';

const ApprovalLeave: React.FC = () => (
  <ApprovalListPage<Leave & { id: string }>
    title="请假审批"
    objectType={OT.Leave}
    service={leaveService as any}
    baseColumns={[
      { title: '编号', dataIndex: 'id', width: 200, render: (v: string) => `#${v.slice(-6)}` },
      { title: '居民', dataIndex: 'resident', width: 140 },
      { title: '请假类型', dataIndex: 'leaveType', width: 130 },
      { title: '开始日期', dataIndex: 'startDate', width: 120 },
      { title: '结束日期', dataIndex: 'endDate', width: 120 },
      { title: '事由', dataIndex: 'reason', ellipsis: true },
    ]}
    renderDetail={(record) => (
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="居民">{String(record.resident)}</Descriptions.Item>
        <Descriptions.Item label="请假类型">{String(record.leaveType)}</Descriptions.Item>
        <Descriptions.Item label="开始日期">{record.startDate as any}</Descriptions.Item>
        <Descriptions.Item label="结束日期">{record.endDate as any}</Descriptions.Item>
        <Descriptions.Item label="事由">{record.reason ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="状态">
          {EnumLabels.ApplicationStatus[record.status as keyof typeof EnumLabels.ApplicationStatus] ??
            record.status}
        </Descriptions.Item>
        <Descriptions.Item label="提交时间">
          {(record as any).submittedAt
            ? new Date((record as any).submittedAt).toLocaleString()
            : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="审批意见">
          {(record as any).approvalOpinion ?? '-'}
        </Descriptions.Item>
      </Descriptions>
    )}
  />
);

export default ApprovalLeave;
