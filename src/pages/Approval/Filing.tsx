import React from 'react';
import ResidentLink from '@/components/ResidentLink';
import { migrantWorkService } from '@/services/domains/migrant-work';
import { OT } from '@/services/ontology/object-types';
import { dictLabel } from '@/stores/dictStore';
import type { MigrantWork } from '@/types/ontology/prh/entities/migrant_work';
import ApprovalListPage from './ApprovalListPage';

const ApprovalFiling: React.FC = () => (
  <ApprovalListPage<MigrantWork & { id: string }>
    title="备案审批(外出务工/异地居住)"
    objectType={OT.MigrantWork}
    service={migrantWorkService as any}
    detailRoute="/approval/filing/detail"
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
        title: '备案类型',
        dataIndex: 'type',
        width: 130,
        render: (v: string) => dictLabel('MigrantWorkType', v),
      },
      { title: '开始日期', dataIndex: 'startDate', width: 120 },
      {
        title: '工作单位',
        dataIndex: 'employerName',
        width: 160,
        ellipsis: true,
      },
    ]}
  />
);

export default ApprovalFiling;
