import React, { useState } from 'react';
import ApplicationListPage from '@/components/ApplicationListPage';
import EntityCreateModal from '@/components/EntityCreateModal';
import ResidentLink from '@/components/ResidentLink';
import { migrantWorkService } from '@/services/domains/migrant-work';
import { OT } from '@/services/ontology/object-types';
import type { MigrantWork } from '@/types/ontology/prh/entities/migrant_work';

const MonitorMigrantWorks: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);

  return (
    <>
      <ApplicationListPage<MigrantWork & { id: string }>
        key={reloadFlag}
        title="外出务工申请"
        objectType={OT.MigrantWork}
        service={migrantWorkService as any}
        detailRoute="/monitor/migrant-works/detail"
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
            title: '务工单位',
            dataIndex: 'company',
            width: 160,
            ellipsis: true,
          },
          { title: '开始日期', dataIndex: 'startDate', width: 120 },
          { title: '结束日期', dataIndex: 'endDate', width: 120 },
          { title: '外出原因', dataIndex: 'reason', ellipsis: true },
        ]}
      />
      <EntityCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => setReloadFlag((v) => v + 1)}
        title="新建外出务工申请"
        service={migrantWorkService as any}
        width={720}
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
            name: 'residentAddress',
            label: '务工居住地址',
            type: 'address',
            required: true,
            placeholder: '务工期间居住的详细地址',
            span: 2,
          },
          { name: 'company', label: '务工单位', type: 'input' },
          { name: 'companyContract', label: '单位联系人', type: 'input' },
          { name: 'companyContractPhone', label: '联系电话', type: 'input' },
          {
            name: 'companyAddress',
            label: '工作地址',
            type: 'address',
            placeholder: '务工单位详细地址',
            span: 2,
          },
          {
            name: 'startDate',
            label: '开始日期',
            type: 'date',
            required: true,
          },
          { name: 'endDate', label: '结束日期', type: 'date' },
          { name: 'reason', label: '外出原因', type: 'textarea', span: 2 },
        ]}
      />
    </>
  );
};

export default MonitorMigrantWorks;
