import React from 'react';
import { Descriptions } from 'antd';
import ApprovalListPage from './ApprovalListPage';
import { migrantWorkService } from '@/services/domains/migrant-work';
import { OT } from '@/services/ontology/object-types';
import type { MigrantWork } from '@/types/ontology/prh/entities/migrant_work';
import { EnumLabels } from '@/utils/enum-options';

const ApprovalFiling: React.FC = () => (
  <ApprovalListPage<MigrantWork & { id: string }>
    title="备案审批(外出务工/异地居住)"
    objectType={OT.MigrantWork}
    service={migrantWorkService as any}
    baseColumns={[
      { title: '编号', dataIndex: 'id', width: 200, render: (v: string) => `#${v.slice(-6)}` },
      { title: '居民', dataIndex: 'resident', width: 140 },
      { title: '备案类型', dataIndex: 'type', width: 140 },
      { title: '开始日期', dataIndex: 'startDate', width: 120 },
      { title: '结束日期', dataIndex: 'endDate', width: 120 },
      {
        title: '工作单位',
        dataIndex: 'employerName',
        width: 160,
        render: (v: string) => v ?? '-',
      },
    ]}
    renderDetail={(record) => (
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="居民">{String(record.resident)}</Descriptions.Item>
        <Descriptions.Item label="备案类型">{String((record as any).type)}</Descriptions.Item>
        <Descriptions.Item label="开始日期">{(record as any).startDate}</Descriptions.Item>
        <Descriptions.Item label="结束日期">{(record as any).endDate}</Descriptions.Item>
        <Descriptions.Item label="事由">{(record as any).reason ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="目的地址">
          {(record as any).destAddress?.detail ?? '-'}
        </Descriptions.Item>
        <Descriptions.Item label="坐标">
          {(record as any).destAddress?.geoPoint
            ? `${(record as any).destAddress.geoPoint.longitude}, ${(record as any).destAddress.geoPoint.latitude}`
            : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="工作单位">
          {(record as any).employerName ?? '-'}
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          {EnumLabels.ApplicationStatus[record.status as keyof typeof EnumLabels.ApplicationStatus] ??
            record.status}
        </Descriptions.Item>
        <Descriptions.Item label="提交时间">
          {(record as any).submittedAt
            ? new Date((record as any).submittedAt).toLocaleString()
            : '-'}
        </Descriptions.Item>
      </Descriptions>
    )}
  />
);

export default ApprovalFiling;
