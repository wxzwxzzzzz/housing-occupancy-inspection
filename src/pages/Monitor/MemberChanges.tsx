import React, { useState } from 'react';
import ApplicationListPage from '@/components/ApplicationListPage';
import EntityCreateModal from '@/components/EntityCreateModal';
import { householdMemberChangeService } from '@/services/domains/change';
import { OT } from '@/services/ontology/object-types';
import { dictLabel, dictStore } from '@/stores/dictStore';
import type { HouseholdMemberChange } from '@/types/ontology/prh/entities/household_member_change';

const MonitorMemberChanges: React.FC = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);

  return (
    <>
      <ApplicationListPage<HouseholdMemberChange & { id: string }>
        key={reloadFlag}
        title="家庭成员变更申请"
        objectType={OT.HouseholdMemberChange}
        service={householdMemberChangeService as any}
        detailRoute="/monitor/member-changes/detail"
        residentField="household"
        allowCreate
        onCreate={() => setCreateOpen(true)}
        extraFilters={[
          {
            key: 'changeType',
            label: '变更类型',
            type: 'select',
            options: dictStore.options('MemberChangeType'),
          },
        ]}
        buildExtraQuery={(builder, v) => {
          if (v.changeType) builder.eq('changeType', v.changeType);
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
            title: '变更类型',
            dataIndex: 'changeType',
            width: 110,
            render: (v: string) => dictLabel('MemberChangeType', v),
          },
          {
            title: '目标成员',
            dataIndex: 'member',
            width: 140,
            render: (v: string) => (v ? `成员#${String(v).slice(-6)}` : '-'),
          },
          { title: '变更原因', dataIndex: 'reason', ellipsis: true },
        ]}
      />
      <EntityCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => setReloadFlag((v) => v + 1)}
        title="新建家庭成员变更"
        service={householdMemberChangeService as any}
        fields={[
          {
            name: 'household',
            label: '所属家庭',
            type: 'refer',
            required: true,
            referObjectType: OT.Household,
            referLabelField: 'applicantName',
            referExtraFilter: (b) => b.in('status', ['ACTIVE', 'CANDIDATE']),
            span: 2,
          },
          {
            name: 'changeType',
            label: '变更类型',
            type: 'select',
            required: true,
            dictName: 'MemberChangeType',
          },
          {
            name: 'member',
            label: '目标成员',
            type: 'refer',
            referObjectType: OT.HouseholdMember,
            referLabelField: 'fullName',
            extra: '移除成员时需要选择已有成员;新增成员可留空,审批通过后录入',
          },
          {
            name: 'reason',
            label: '变更原因',
            type: 'textarea',
            required: true,
            span: 2,
          },
        ]}
      />
    </>
  );
};

export default MonitorMemberChanges;
