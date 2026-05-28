import React, { useState } from 'react';
import ApplicationListPage from '@/components/ApplicationListPage';
import EntityCreateModal from '@/components/EntityCreateModal';
import ResidentLink from '@/components/ResidentLink';
import { residenceChangeService } from '@/services/domains/change';
import { OT } from '@/services/ontology/object-types';
import type { ResidenceChange } from '@/types/ontology/prh/entities/residence_change';

const MonitorResidenceChanges: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);

  return (
    <>
      <ApplicationListPage<ResidenceChange & { id: string }>
        key={reloadFlag}
        title="居住地址变更申请"
        objectType={OT.ResidenceChange}
        service={residenceChangeService as any}
        detailRoute="/monitor/residence-changes/detail"
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
            title: '新地址',
            dataIndex: 'address',
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
        title="新建居住地址变更"
        service={residenceChangeService as any}
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
            name: 'address',
            label: '新居住地址',
            type: 'address',
            required: true,
            placeholder: '请输入完整的新居住地址',
            span: 2,
          },
          {
            name: 'reason',
            label: '变更原因',
            type: 'textarea',
            span: 2,
          },
        ]}
      />
    </>
  );
};

export default MonitorResidenceChanges;
