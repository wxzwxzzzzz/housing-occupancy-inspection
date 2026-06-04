/**
 * 租赁补贴详情 — RentalSubsidy
 * 状态机:DRAFT → SUBSIDY_ACTIVE → SUBSIDY_SUSPENDED / SUBSIDY_TERMINATED / SUBSIDY_EXPIRED
 */

import { useNavigate, useParams } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Modal, message, Skeleton, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  type DetailSection,
  type DetailTabItem,
  OmnibarDetailPage,
  type StatusBadge,
  type ToolbarAction,
} from '@/components/OmnibarPage';
import { rentalSubsidyService } from '@/services/domains/eligibility';
import { invokeAction } from '@/services/ontology/client';
import { OT } from '@/services/ontology/object-types';
import { lifecyclePanelStore, type LifecycleStep } from '@/stores';
import { dictLabel } from '@/stores/dictStore';

const StatusBadgeColor: Record<string, StatusBadge['color']> = {
  DRAFT: 'secondary',
  SUBSIDY_ACTIVE: 'success',
  SUBSIDY_SUSPENDED: 'warning',
  SUBSIDY_TERMINATED: 'danger',
  SUBSIDY_EXPIRED: 'secondary',
};

/** 补贴状态机流程节点 */
const SUBSIDY_LIFECYCLE_STEPS: LifecycleStep[] = [
  { status: 'DRAFT', label: '草稿', kind: 'main', desc: '补贴方案录入,待提交生效' },
  { status: 'SUBSIDY_ACTIVE', label: '发放中', kind: 'main', desc: '补贴正常按月发放' },
  { status: 'SUBSIDY_SUSPENDED', label: '已暂停', kind: 'branch', desc: '暂停发放,可恢复' },
  { status: 'SUBSIDY_EXPIRED', label: '已到期', kind: 'terminal', desc: '到达截止日期自动结束' },
  { status: 'SUBSIDY_TERMINATED', label: '已终止', kind: 'terminal', desc: '提前终止,不可恢复' },
];

const RentalSubsidyDetail: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data,
    loading,
    refresh: reload,
  } = useRequest(
    async () => (id ? (await rentalSubsidyService.detail(id)).data : null),
    { refreshDeps: [id] },
  );
  const [busy, setBusy] = useState(false);

  // 注入状态流程面板上下文 → 右侧 rail 显示「状态流程」入口并自动展开
  const recordStatus = (data as any)?.status as string | undefined;
  useEffect(() => {
    if (data) {
      lifecyclePanelStore.setContext(
        '补贴状态流程',
        SUBSIDY_LIFECYCLE_STEPS,
        recordStatus,
        'SubsidyStatus',
      );
    }
    return () => lifecyclePanelStore.clear();
  }, [data, recordStatus]);

  if (loading || !data) {
    return (
      <div style={{ padding: 16 }}>
        <Skeleton active />
      </div>
    );
  }

  const r = data as any;
  const status = r.status;

  const callAction = async (
    action: 'submit' | 'unsubmit' | 'suspend' | 'resume' | 'terminate',
  ) => {
    setBusy(true);
    try {
      await invokeAction({
        objectType: OT.RentalSubsidy,
        actionName: action,
        payload: { id },
      });
      message.success('操作成功');
      reload();
    } finally {
      setBusy(false);
    }
  };

  const confirmTerminate = () => {
    Modal.confirm({
      title: '确认终止该补贴?',
      okType: 'danger',
      onOk: () => callAction('terminate'),
    });
  };

  const headerActions: ToolbarAction[] = (() => {
    const list: ToolbarAction[] = [];
    if (status === 'DRAFT') {
      list.push({
        key: 'submit',
        type: 'primary',
        label: '提交生效',
        onClick: () => callAction('submit'),
        disabled: busy,
      });
    } else if (status === 'SUBSIDY_ACTIVE') {
      list.push({
        key: 'unsubmit',
        label: '撤回',
        onClick: () => callAction('unsubmit'),
        disabled: busy,
      });
      list.push({
        key: 'suspend',
        label: '暂停发放',
        onClick: () => callAction('suspend'),
        disabled: busy,
      });
      list.push({
        key: 'terminate',
        danger: true,
        label: '终止补贴',
        onClick: confirmTerminate,
        disabled: busy,
      });
    } else if (status === 'SUBSIDY_SUSPENDED') {
      list.push({
        key: 'resume',
        type: 'primary',
        label: '恢复发放',
        onClick: () => callAction('resume'),
        disabled: busy,
      });
      list.push({
        key: 'terminate',
        danger: true,
        label: '终止补贴',
        onClick: confirmTerminate,
        disabled: busy,
      });
    }
    return list;
  })();

  const sections: DetailSection[] = [
    {
      key: 'base',
      title: '补贴信息',
      fields: [
        {
          label: '所属家庭',
          value: r.household ? `家庭#${String(r.household).slice(-6)}` : '-',
        },
        { label: '月补贴金额(元)', value: r.monthlyAmount ?? '-' },
        { label: '起始日期', value: r.startDate ?? '-' },
        { label: '截止日期', value: r.endDate ?? '-' },
        { label: '收款账户', value: r.bankAccount ?? '-' },
        { label: '开户行', value: r.bankName ?? '-' },
        {
          label: '状态',
          value: <Tag>{dictLabel('SubsidyStatus', status)}</Tag>,
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
          补贴详情。可暂停 / 恢复 / 终止;到期会自动转为已到期。
        </div>
      ),
    },
  ];

  return (
    <OmnibarDetailPage
      title={`补贴 #${String(r.id).slice(-6)}`}
      statusBadge={{
        text: dictLabel('SubsidyStatus', status),
        color: StatusBadgeColor[status] ?? 'secondary',
      }}
      onBack={() => navigate('/eligibility/subsidies')}
      backLabel="返回补贴列表"
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

export default RentalSubsidyDetail;
