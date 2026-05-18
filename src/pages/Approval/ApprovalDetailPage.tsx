/**
 * 通用审批详情壳页 — 封装通过/驳回 + Y/N 快捷键
 *
 * Material/Leave/Filing 的 Detail 都用它包装,只传 sections + 业务字段。
 */

import React, { useState } from 'react';
import { Button, Form, Input, message, Modal, Tooltip, Skeleton } from 'antd';
import { CheckOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useKeyPress } from 'ahooks';
import { useNavigate, useParams } from '@umijs/max';
import { approvalService } from '@/services/domains/approval';
import type { EntityApi } from '@/services/ontology/crud';
import { EnumLabels, StatusColors } from '@/utils/enum-options';
import {
  OmnibarDetailPage,
  useDetail,
  type DetailSection,
  type DetailTabItem,
  type StatusBadge,
  type ToolbarAction,
} from '@/components/OmnibarPage';

interface ApprovalDetailPageProps<T extends { id: string; status?: string }> {
  /** 业务对象类型,如 OT.Leave */
  objectType: string;
  service: EntityApi<T>;
  /** 标题前缀,如 "请假申请" */
  titlePrefix: string;
  /** 列表页路由,返回时 navigate(-1) 兜底,默认 -1 */
  listRoute?: string;
  /** 渲染 sections */
  buildSections: (record: T) => DetailSection[];
  /** 额外 tabs */
  buildTabs?: (record: T) => DetailTabItem[];
  /** 顶部头部额外操作(在通过/驳回之前) */
  extraHeaderActions?: (record: T) => ToolbarAction[];
}

function getStatusBadge(status: string | undefined): StatusBadge {
  const colorMap: Record<string, StatusBadge['color']> = {
    DRAFT: 'secondary',
    UNDER_APPROVAL: 'warning',
    COMPLETED: 'success',
    REJECTED: 'danger',
    WITHDRAWN: 'secondary',
  };
  return {
    text:
      EnumLabels.ApplicationStatus[status as keyof typeof EnumLabels.ApplicationStatus] ??
      status ??
      '-',
    color: colorMap[status ?? ''] ?? 'secondary',
  };
}

export function ApprovalDetailPage<T extends { id: string; status?: string }>(
  props: ApprovalDetailPageProps<T>,
) {
  const {
    objectType,
    service,
    titlePrefix,
    listRoute,
    buildSections,
    buildTabs,
    extraHeaderActions,
  } = props;

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fetcher = React.useCallback(
    async (rid: string) => {
      const env = await service.detail(rid);
      return env.data as T;
    },
    [service],
  );
  const { data, loading, reload } = useDetail<T>(id, fetcher);

  const [approving, setApproving] = useState<'approve' | 'reject' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const handleConfirm = async () => {
    if (!data || !approving) return;
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (approving === 'approve') {
        await approvalService.approve(objectType, data.id, values.opinion);
        message.success('已通过');
      } else {
        await approvalService.reject(objectType, data.id, values.opinion);
        message.success('已驳回');
      }
      setApproving(null);
      form.resetFields();
      // 刷新当前详情(状态会变成 COMPLETED/REJECTED)
      await reload();
    } finally {
      setSubmitting(false);
    }
  };

  // ==== Y / N 快捷键 ====
  useKeyPress(
    ['y', 'Y'],
    (e) => {
      if (isInputFocus()) return;
      if (data?.status !== 'UNDER_APPROVAL') return;
      e.preventDefault();
      setApproving('approve');
    },
    { exactMatch: false },
  );
  useKeyPress(
    ['n', 'N'],
    (e) => {
      if (isInputFocus()) return;
      if (data?.status !== 'UNDER_APPROVAL') return;
      e.preventDefault();
      setApproving('reject');
    },
    { exactMatch: false },
  );

  if (loading || !data) {
    return (
      <div style={{ padding: 16 }}>
        <Skeleton active />
      </div>
    );
  }

  const isApprovable = data.status === 'UNDER_APPROVAL';

  const headerActions: ToolbarAction[] = [
    ...(extraHeaderActions?.(data) ?? []),
    ...(isApprovable
      ? [
          {
            key: 'approve',
            type: 'primary' as const,
            label: '通过 (Y)',
            icon: <CheckOutlined />,
            onClick: () => setApproving('approve'),
            title: '快捷键 Y',
          },
          {
            key: 'reject',
            label: '驳回 (N)',
            danger: true,
            icon: <CloseOutlined />,
            onClick: () => setApproving('reject'),
            title: '快捷键 N',
          },
        ]
      : []),
    { divider: true },
    {
      key: 'back',
      label: '返回列表',
      icon: <ArrowLeftOutlined />,
      onClick: () => (listRoute ? navigate(listRoute) : navigate(-1)),
    },
  ];

  const tabs: DetailTabItem[] = buildTabs?.(data) ?? [
    {
      key: 'flow',
      label: '审批流程',
      content: (
        <div style={{ padding: 16, color: '#595959' }}>
          {(data as any).submittedAt && (
            <p>
              提交时间:{new Date((data as any).submittedAt).toLocaleString()}
              {(data as any).submittedBy && ` / 提交人:${(data as any).submittedBy}`}
            </p>
          )}
          {(data as any).approver && (
            <p>
              审批人:{(data as any).approver}
              {(data as any).approvalTime &&
                ` / 时间:${new Date((data as any).approvalTime).toLocaleString()}`}
            </p>
          )}
          {(data as any).approvalOpinion && (
            <p>审批意见:{(data as any).approvalOpinion}</p>
          )}
          {!(data as any).submittedAt && !(data as any).approvalOpinion && (
            <span>暂无审批流程记录</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 16, height: 'calc(100vh - 64px - 45px)' }}>
      <OmnibarDetailPage
        title={`${titlePrefix} #${String(data.id).slice(-6)}`}
        statusBadge={getStatusBadge(data.status)}
        onBack={() => (listRoute ? navigate(listRoute) : navigate(-1))}
        headerActions={headerActions}
        sections={buildSections(data)}
        tabs={tabs}
        editable
        record={data as Record<string, any>}
        onSave={async (values) => {
          await service.modify({ ...(data as any), ...values });
        }}
        onSaved={reload}
        footerFields={[
          { label: '提交人', value: (data as any).submittedBy ?? '-' },
          {
            label: '提交时间',
            value: (data as any).submittedAt
              ? new Date((data as any).submittedAt).toLocaleString()
              : '-',
          },
          { label: '审批人', value: (data as any).approver ?? '-' },
          {
            label: '审批时间',
            value: (data as any).approvalTime
              ? new Date((data as any).approvalTime).toLocaleString()
              : '-',
          },
        ]}
      />

      <Modal
        title={approving === 'approve' ? '审批通过' : '审批驳回'}
        open={!!approving}
        onOk={handleConfirm}
        confirmLoading={submitting}
        okText="确认提交"
        onCancel={() => {
          setApproving(null);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="opinion"
            label={approving === 'approve' ? '审批意见' : '驳回原因'}
            rules={
              approving === 'reject'
                ? [{ required: true, message: '请填写驳回原因' }]
                : []
            }
          >
            <Input.TextArea rows={4} placeholder="请输入..." autoFocus />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function isInputFocus(): boolean {
  const ae = document.activeElement;
  if (!ae) return false;
  const tag = ae.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if ((ae as HTMLElement).isContentEditable) return true;
  return false;
}

export default ApprovalDetailPage;
