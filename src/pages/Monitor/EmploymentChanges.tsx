import React, { useState } from 'react';
import ApplicationListPage from '@/components/ApplicationListPage';
import EntityCreateModal from '@/components/EntityCreateModal';
import ResidentLink from '@/components/ResidentLink';
import { employmentChangeService } from '@/services/domains/change';
import { OT } from '@/services/ontology/object-types';
import type { EmploymentChange } from '@/types/ontology/prh/entities/employment_change';

const MonitorEmploymentChanges: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);

  return (
    <>
      <ApplicationListPage<EmploymentChange & { id: string }>
        key={reloadFlag}
        title="工作地址变更申请"
        objectType={OT.EmploymentChange}
        service={employmentChangeService as any}
        detailRoute="/monitor/employment-changes/detail"
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
            title: '工作单位',
            dataIndex: 'company',
            width: 160,
            ellipsis: true,
          },
          {
            title: '工作地址',
            dataIndex: 'companyAddress',
            ellipsis: true,
            render: (v: any) => (v ? (v.detail ?? '-') : '-'),
          },
          { title: '变更原因', dataIndex: 'reason', ellipsis: true },
        ]}
      />
      <EntityCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => setReloadFlag((v) => v + 1)}
        title="新建工作地址变更"
        service={employmentChangeService as any}
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
          { name: 'company', label: '工作单位', type: 'input', required: true },
          {
            name: 'companyAddress',
            label: '工作地址',
            type: 'address',
            required: true,
            placeholder: '工作单位详细地址',
            span: 2,
          },
          { name: 'companyContract', label: '单位联系人', type: 'input' },
          { name: 'companyContractPhone', label: '联系电话', type: 'input' },
          { name: 'reason', label: '变更原因', type: 'textarea', span: 2 },
        ]}
      />
    </>
  );
};

export default MonitorEmploymentChanges;
