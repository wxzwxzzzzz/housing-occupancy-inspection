/**
 * 保障资格终止 — EligibilityTermination
 *
 * 申请单类,走 ApplicationStatus 状态机。
 */

import React, { useState } from 'react';
import ApplicationListPage from '@/components/ApplicationListPage';
import EntityCreateModal from '@/components/EntityCreateModal';
import { eligibilityTerminationService } from '@/services/domains/eligibility';
import { OT } from '@/services/ontology/object-types';
import { dictLabel, dictStore } from '@/stores/dictStore';
import type { EligibilityTermination } from '@/types/ontology/prh/entities/eligibility_termination';

const EligibilityTerminations: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);

  return (
    <>
      <ApplicationListPage<EligibilityTermination & { id: string }>
        key={reloadFlag}
        title="保障资格终止申请"
        objectType={OT.EligibilityTermination}
        service={eligibilityTerminationService as any}
        detailRoute="/eligibility/terminations/detail"
        residentField="household"
        allowCreate
        onCreate={() => setCreateOpen(true)}
        extraFilters={[
          {
            key: 'terminationType',
            label: '终止类型',
            type: 'select',
            options: dictStore.options('TerminationReason'),
          },
        ]}
        buildExtraQuery={(builder, v) => {
          if (v.terminationType)
            builder.eq('terminationType', v.terminationType);
        }}
        baseColumns={[
          {
            title: '编号',
            dataIndex: 'id',
            width: 110,
            render: (v: string) => `#${v.slice(-6)}`,
          },
          {
            title: '所属家庭',
            dataIndex: 'household',
            width: 140,
            render: (v: string) => (v ? `家庭#${String(v).slice(-6)}` : '-'),
          },
          {
            title: '终止类型',
            dataIndex: 'terminationType',
            width: 130,
            render: (v: string) => dictLabel('TerminationReason', v),
          },
          { title: '期望生效日期', dataIndex: 'effectiveDate', width: 130 },
          { title: '终止原因', dataIndex: 'reason', ellipsis: true },
        ]}
      />
      <EntityCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => setReloadFlag((v) => v + 1)}
        title="新建资格终止申请"
        service={eligibilityTerminationService as any}
        fields={[
          {
            name: 'household',
            label: '所属家庭',
            type: 'refer',
            required: true,
            referObjectType: OT.Household,
            referLabelField: 'applicantName',
            referExtraFilter: (b) => b.eq('status', 'ACTIVE'),
            span: 2,
          },
          {
            name: 'terminationType',
            label: '终止类型',
            type: 'select',
            required: true,
            dictName: 'TerminationReason',
          },
          {
            name: 'effectiveDate',
            label: '期望生效日期',
            type: 'date',
            required: true,
          },
          {
            name: 'reason',
            label: '终止原因',
            type: 'textarea',
            span: 2,
          },
        ]}
      />
    </>
  );
};

export default EligibilityTerminations;
