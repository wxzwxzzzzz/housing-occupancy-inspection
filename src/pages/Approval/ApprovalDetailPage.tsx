/**
 * 通用审批详情壳页 — 封装通过/驳回 + Y/N 快捷键
 *
 * Material/Leave/Filing 的 Detail 都用它包装,只传 sections + 业务字段。
 */

import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from '@umijs/max';
import { Skeleton } from 'antd';
import React, { useEffect } from 'react';
import {
  type DetailSection,
  type DetailTabItem,
  OmnibarDetailPage,
  type StatusBadge,
  type ToolbarAction,
  useDetail,
} from '@/components/OmnibarPage';
import type { EntityApi } from '@/services/ontology/crud';
import { approvalPanelStore } from '@/stores';
import { EnumLabels } from '@/utils/enum-options';

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
      EnumLabels.ApplicationStatus[
        status as keyof typeof EnumLabels.ApplicationStatus
      ] ??
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

  // 把当前单据注入审批面板上下文 → 右侧 rail 显示「审批」入口并默认展开
  useEffect(() => {
    if (data?.id) {
      approvalPanelStore.setContext(objectType, data.id, data.status, reload);
    }
    return () => approvalPanelStore.clear();
  }, [objectType, data?.id, data?.status, reload]);

  if (loading || !data) {
    return (
      <div style={{ padding: 16 }}>
        <Skeleton active />
      </div>
    );
  }

  const headerActions: ToolbarAction[] = [
    ...(extraHeaderActions?.(data) ?? []),
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
              {(data as any).submittedBy &&
                ` / 提交人:${(data as any).submittedBy}`}
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
    <div style={{ height: '100%' }}>
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
    </div>
  );
}

export default ApprovalDetailPage;
