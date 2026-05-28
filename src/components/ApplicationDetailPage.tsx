/**
 * 通用申请单详情页 — ApplicationDetailPage
 *
 * 适用所有"申请单"类(混入 IApprovalFlow + ApplicationStatus 状态机)的详情视图。
 *
 * 提供:
 *   - 标题 + 状态徽章
 *   - 配置化字段段(sections)
 *   - 状态机动作按钮(submit / unsubmit / approve / reject / cancel)
 *   - 审计 footer(创建/修改/提交/审批 4 类时间)
 *   - 审批时间线
 *
 * 用法:
 *   <ApplicationDetailPage
 *     title="请假申请"
 *     objectType={OT.Leave}
 *     service={leaveService}
 *     listPath="/monitor/leaves"
 *     buildSections={(record) => [
 *       { key: 'base', title: '基本信息', fields: [...] }
 *     ]}
 *   />
 */

import { useNavigate, useParams } from '@umijs/max';
import { useRequest } from 'ahooks';
import {
  Card,
  Form,
  Input,
  Modal,
  message,
  Skeleton,
  Space,
  Tag,
  Timeline,
} from 'antd';
import React, { useCallback } from 'react';
import {
  type DetailSection,
  type DetailTabItem,
  OmnibarDetailPage,
  type StatusBadge,
  type ToolbarAction,
} from '@/components/OmnibarPage';
import { approvalService } from '@/services/domains/approval';
import { invokeAction } from '@/services/ontology/client';
import type { EntityApi } from '@/services/ontology/crud';
import { dictLabel } from '@/stores/dictStore';
import { StatusColors } from '@/utils/enum-options';

export interface ApplicationDetailPageProps<T = Record<string, any>> {
  /** 页面标题前缀,如"请假申请" */
  title: string;
  /** 本体类型,如 OT.Leave */
  objectType: string;
  /** 实体 service */
  service: EntityApi<T>;
  /** 返回列表的路径,如 /monitor/leaves */
  listPath: string;
  /** 构造字段段(record 已加载好) */
  buildSections: (record: any) => DetailSection[];
  /** 额外的 Tab(如附件 / 关联记录) */
  buildTabs?: (record: any) => DetailTabItem[];
  /** 默认 tabKey */
  defaultTabKey?: string;
  /** 是否允许审批通过/驳回(默认 true) */
  allowApprove?: boolean;
  /** 是否允许取消(默认 true,对应 cancel 动作) */
  allowCancel?: boolean;
  /** 业务侧追加的头部按钮(放在状态机按钮之后) */
  extraHeaderActions?: (record: any, reload: () => void) => ToolbarAction[];
}

function statusBadge(status?: string): StatusBadge {
  const map: Record<string, StatusBadge['color']> = {
    DRAFT: 'secondary',
    UNDER_APPROVAL: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'secondary',
  };
  return {
    text: dictLabel('ApplicationStatus', status),
    color: map[status ?? ''] ?? 'secondary',
  };
}

function ApplicationDetailPageInner<T = Record<string, any>>(
  props: ApplicationDetailPageProps<T>,
) {
  const {
    title,
    objectType,
    service,
    listPath,
    buildSections,
    buildTabs,
    defaultTabKey,
    allowApprove = true,
    allowCancel = true,
    extraHeaderActions,
  } = props;
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fetcher = useCallback(async () => {
    if (!id) return null;
    const env = await service.detail(id);
    return env.data as any;
  }, [id, service]);
  const {
    data: record,
    loading,
    refresh: reload,
  } = useRequest(fetcher, {
    refreshDeps: [id],
  });

  const [opinionModal, setOpinionModal] = React.useState<
    'approve' | 'reject' | null
  >(null);
  const [submittingApprove, setSubmittingApprove] = React.useState(false);
  const [opinionForm] = Form.useForm();

  const handleSubmitApplication = async () => {
    await service.submit(id);
    message.success('已提交');
    reload();
  };
  const handleUnsubmit = async () => {
    await service.unsubmit(id);
    message.success('已撤回');
    reload();
  };
  const handleCancel = async () => {
    Modal.confirm({
      title: '确认取消该申请?',
      okType: 'danger',
      onOk: async () => {
        await invokeAction({
          objectType,
          actionName: 'cancel',
          payload: { id },
        });
        message.success('已取消');
        reload();
      },
    });
  };

  const handleApproveSubmit = async () => {
    if (!opinionModal) return;
    const values = await opinionForm.validateFields();
    setSubmittingApprove(true);
    try {
      if (opinionModal === 'approve') {
        await approvalService.approve(objectType, id, values.opinion);
        message.success('已通过');
      } else {
        await approvalService.reject(objectType, id, values.opinion);
        message.success('已驳回');
      }
      setOpinionModal(null);
      opinionForm.resetFields();
      reload();
    } finally {
      setSubmittingApprove(false);
    }
  };

  if (loading || !record) {
    return (
      <div style={{ padding: 16 }}>
        <Skeleton active />
      </div>
    );
  }

  const r = record as any;
  const status = r.status as string;

  // 头部按钮:按状态机决定可见性
  const headerActions: ToolbarAction[] = (() => {
    const list: ToolbarAction[] = [];
    if (status === 'DRAFT') {
      list.push({
        key: 'submit',
        type: 'primary',
        label: '提交',
        onClick: handleSubmitApplication,
      });
    } else if (status === 'UNDER_APPROVAL') {
      list.push({
        key: 'unsubmit',
        label: '撤回',
        onClick: handleUnsubmit,
      });
      if (allowApprove) {
        list.push({
          key: 'approve',
          type: 'primary',
          label: '审批通过',
          onClick: () => {
            setOpinionModal('approve');
          },
        });
        list.push({
          key: 'reject',
          danger: true,
          label: '驳回',
          onClick: () => {
            setOpinionModal('reject');
          },
        });
      }
    }
    if (allowCancel && (status === 'DRAFT' || status === 'UNDER_APPROVAL')) {
      list.push({
        key: 'cancel',
        danger: true,
        label: '取消申请',
        onClick: handleCancel,
      });
    }
    if (extraHeaderActions) {
      list.push(...extraHeaderActions(r, reload));
    }
    return list;
  })();

  // 审批时间线 Tab
  const timelineTab: DetailTabItem = {
    key: 'timeline',
    label: '审批时间线',
    content: (
      <Card size="small" style={{ margin: 12 }}>
        <Timeline
          items={
            [
              r.createAt && {
                color: 'gray',
                children: `${r.createAt} 创建草稿(${r.creator ?? '-'})`,
              },
              r.submittedAt && {
                color: 'blue',
                children: `${r.submittedAt} 提交申请(${r.submittedBy ?? '-'})`,
              },
              r.withdrawnAt && {
                color: 'gray',
                children: `${r.withdrawnAt} 撤回(${r.withdrawnBy ?? '-'})`,
              },
              r.approvalTime && {
                color:
                  r.approvalResult === 'REJECTED'
                    ? 'red'
                    : r.approvalResult === 'RETURNED'
                      ? 'orange'
                      : 'green',
                children: `${r.approvalTime} ${
                  r.approvalResult === 'REJECTED'
                    ? '已驳回'
                    : r.approvalResult === 'RETURNED'
                      ? '已退回'
                      : '已通过'
                } (${r.approver ?? '-'})${
                  r.approvalOpinion ? ` — 意见: ${r.approvalOpinion}` : ''
                }`,
              },
            ].filter(Boolean) as any
          }
        />
      </Card>
    ),
  };

  const tabs: DetailTabItem[] = buildTabs
    ? [timelineTab, ...buildTabs(r)]
    : [timelineTab];

  return (
    <>
      <OmnibarDetailPage
        title={`${title} #${String(r.id).slice(-6)}`}
        statusBadge={statusBadge(status)}
        onBack={() => navigate(listPath)}
        backLabel="返回列表"
        headerActions={headerActions}
        sections={buildSections(r)}
        tabs={tabs}
        defaultTabKey={defaultTabKey ?? tabs[0]?.key}
        footerFields={[
          { label: '创建人', value: r.creator ?? '-' },
          { label: '创建时间', value: r.createAt ?? '-' },
          { label: '提交人', value: r.submittedBy ?? '-' },
          { label: '提交时间', value: r.submittedAt ?? '-' },
          { label: '审批人', value: r.approver ?? '-' },
        ]}
      />

      <Modal
        title={opinionModal === 'approve' ? '审批通过' : '审批驳回'}
        open={!!opinionModal}
        onOk={handleApproveSubmit}
        onCancel={() => {
          setOpinionModal(null);
          opinionForm.resetFields();
        }}
        confirmLoading={submittingApprove}
        okText="确认"
        cancelText="取消"
        styles={{ footer: { textAlign: 'right' } }}
      >
        <Form form={opinionForm} layout="vertical">
          <Form.Item
            name="opinion"
            label={opinionModal === 'approve' ? '审批意见' : '驳回原因'}
            rules={
              opinionModal === 'reject'
                ? [{ required: true, message: '请填写驳回原因' }]
                : []
            }
          >
            <Input.TextArea rows={4} placeholder="请输入审批意见..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

const ApplicationDetailPage = ApplicationDetailPageInner as <
  T = Record<string, any>,
>(
  props: ApplicationDetailPageProps<T>,
) => React.ReactElement;

export default ApplicationDetailPage;
