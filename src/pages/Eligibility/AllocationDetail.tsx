/**
 * 实物配租详情 — HousingAllocation
 * 状态机:DRAFT → ALLOC_ACTIVE → ALLOC_TERMINATED / ALLOC_EXPIRED
 */

import { useNavigate, useParams } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Modal, message, Skeleton, Tag } from 'antd';
import React, { useState } from 'react';
import {
  type DetailSection,
  type DetailTabItem,
  OmnibarDetailPage,
  type StatusBadge,
  type ToolbarAction,
} from '@/components/OmnibarPage';
import { housingAllocationService } from '@/services/domains/eligibility';
import { invokeAction } from '@/services/ontology/client';
import { OT } from '@/services/ontology/object-types';
import { dictLabel, dictStore } from '@/stores/dictStore';

const StatusBadgeColor: Record<string, StatusBadge['color']> = {
  DRAFT: 'secondary',
  ALLOC_ACTIVE: 'success',
  ALLOC_TERMINATED: 'danger',
  ALLOC_EXPIRED: 'warning',
};

const HousingAllocationDetail: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data,
    loading,
    refresh: reload,
  } = useRequest(
    async () => (id ? (await housingAllocationService.detail(id)).data : null),
    { refreshDeps: [id] },
  );
  const [terminating, setTerminating] = useState(false);

  if (loading || !data) {
    return (
      <div style={{ padding: 16 }}>
        <Skeleton active />
      </div>
    );
  }

  const r = data as any;
  const status = r.status;

  const handleSubmit = async () => {
    await housingAllocationService.submit(id);
    message.success('已提交生效');
    reload();
  };
  const handleUnsubmit = async () => {
    await housingAllocationService.unsubmit(id);
    message.success('已撤回');
    reload();
  };
  const handleTerminate = () => {
    Modal.confirm({
      title: '确认终止该配租?',
      okType: 'danger',
      onOk: async () => {
        setTerminating(true);
        try {
          await invokeAction({
            objectType: OT.HousingAllocation,
            actionName: 'terminate',
            payload: { id },
          });
          message.success('已终止');
          reload();
        } finally {
          setTerminating(false);
        }
      },
    });
  };

  const headerActions: ToolbarAction[] = (() => {
    const list: ToolbarAction[] = [];
    if (status === 'DRAFT') {
      list.push({
        key: 'submit',
        type: 'primary',
        label: '提交生效',
        onClick: handleSubmit,
      });
    } else if (status === 'ALLOC_ACTIVE') {
      list.push({
        key: 'unsubmit',
        label: '撤回',
        onClick: handleUnsubmit,
      });
      list.push({
        key: 'terminate',
        danger: true,
        label: '终止配租',
        onClick: handleTerminate,
        disabled: terminating,
      });
    }
    return list;
  })();

  const sections: DetailSection[] = [
    {
      key: 'base',
      title: '配租信息',
      fields: [
        {
          label: '所属家庭',
          value: r.household ? `家庭#${String(r.household).slice(-6)}` : '-',
        },
        { label: '项目名称', value: r.projectName ?? '-' },
        { label: '楼栋号', value: r.buildingNo ?? '-' },
        { label: '单元号', value: r.unitNo ?? '-' },
        { label: '房号', value: r.roomNo ?? '-' },
        { label: '面积(㎡)', value: r.area ?? '-' },
        { label: '月租金(元)', value: r.monthlyRent ?? '-' },
        { label: '起租日期', value: r.leaseStartDate ?? '-' },
        { label: '到期日期', value: r.leaseEndDate ?? '-' },
        {
          label: '状态',
          value: <Tag>{dictLabel('AllocationStatus', status)}</Tag>,
        },
      ],
    },
  ];

  const tabs: DetailTabItem[] = [
    {
      key: 'overview',
      label: '概览',
      content: (
        <div style={{ padding: 24, color: '#888' }}>
          配租详情。终止后家庭可重新申请新的配租。
        </div>
      ),
    },
  ];

  return (
    <OmnibarDetailPage
      title={`配租 #${String(r.id).slice(-6)} · ${r.projectName ?? ''}`}
      statusBadge={{
        text: dictLabel('AllocationStatus', status),
        color: StatusBadgeColor[status] ?? 'secondary',
      }}
      onBack={() => navigate('/eligibility/allocations')}
      backLabel="返回配租列表"
      headerActions={headerActions}
      sections={sections}
      tabs={tabs}
      footerFields={[
        { label: '创建人', value: r.creator ?? '-' },
        { label: '创建时间', value: r.createAt ?? '-' },
        { label: '修改人', value: r.modifier ?? '-' },
        { label: '修改时间', value: r.modifyAt ?? '-' },
      ]}
    />
  );
};

export default HousingAllocationDetail;
