/**
 * 审批列表页(主从布局 + 流水线作业)
 *
 * 改造点:
 *  - 列表 + 详情常驻分栏(40/60),选中行右侧自动展示
 *  - 顶部状态筛选下拉
 *  - 详情区底部审批工具栏:通过 / 驳回(快捷键 Y / N)
 *  - 通过/驳回成功后自动选中下一行,实现"流水线"
 *  - 列表行右键 → 跳到 360 视图 / 复制居民信息
 *
 * 三个壳页(Material/Leave/Filing)无需改动,继续传 baseColumns + renderDetail。
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Button, Dropdown, Form, Input, message, Modal, Select, Space, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined, MoreOutlined, ReloadOutlined } from '@ant-design/icons';
import { useKeyPress } from 'ahooks';
import type { ColumnsType } from 'antd/es/table';
import { approvalService } from '@/services/domains/approval';
import { qb } from '@/services/ontology/query';
import type { EntityApi } from '@/services/ontology/crud';
import { ApplicationStatus } from '@/types/ontology/prh/enums';
import { EnumLabels, StatusColors, enumOptions } from '@/utils/enum-options';
import MasterDetailListPage, {
  type MasterDetailContext,
} from '@/components/MasterDetailListPage';
import ResidentLink from '@/components/ResidentLink';
import EnhancedTag from '@/components/EnhancedTag';

interface ApprovalListPageProps<T extends { id: string; status?: string; resident?: any }> {
  title: string;
  objectType: string;
  service: EntityApi<T>;
  /** 列表精简列(不含状态/操作,组件内自动追加) */
  baseColumns: ColumnsType<T>;
  /** 右侧详情渲染 */
  renderDetail?: (record: T) => React.ReactNode;
  /** localStorage 分栏比例 key */
  storageKey?: string;
}

export function ApprovalListPage<T extends { id: string; status?: string; resident?: any }>(
  props: ApprovalListPageProps<T>,
) {
  const { title, objectType, service, baseColumns, renderDetail, storageKey } = props;

  const [statusFilter, setStatusFilter] = useState<string | undefined>('UNDER_APPROVAL');
  const [approving, setApproving] = useState<{ record: T; type: 'approve' | 'reject' } | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const ctxRef = useRef<MasterDetailContext<T>>(null);

  const buildQuery = useCallback(() => {
    const builder = qb(objectType).orderBy('createAt', 'DESC');
    if (statusFilter) builder.eq('status', statusFilter);
    return builder.build();
  }, [objectType, statusFilter]);

  // 状态筛选变化时,触发 reload
  const reloadKey = useMemo(() => statusFilter ?? '__all__', [statusFilter]);

  const handleApproval = useCallback(
    async (record: T, type: 'approve' | 'reject', opinion?: string) => {
      setSubmitting(true);
      try {
        if (type === 'approve') {
          await approvalService.approve(objectType, record.id, opinion);
          message.success('已通过');
        } else {
          await approvalService.reject(objectType, record.id, opinion);
          message.success('已驳回');
        }
        // 流水线:自动跳下一条
        ctxRef.current?.selectNext();
        await ctxRef.current?.reload();
      } finally {
        setSubmitting(false);
      }
    },
    [objectType],
  );

  const handleConfirm = async () => {
    if (!approving) return;
    const values = await form.validateFields();
    await handleApproval(approving.record, approving.type, values.opinion);
    setApproving(null);
    form.resetFields();
  };

  // ============ 详情区按钮 ============
  const renderActions = (record: T) => {
    if (record.status !== 'UNDER_APPROVAL') {
      return (
        <span style={{ color: '#8c8c8c' }}>
          当前状态不可审批(快捷键:↑/↓ 切换条目,Esc 取消选中)
        </span>
      );
    }
    return (
      <>
        <Tooltip title="快捷键 Y">
          <Button
            type="primary"
            icon={<CheckOutlined />}
            loading={submitting}
            onClick={() => setApproving({ record, type: 'approve' })}
          >
            通过 (Y)
          </Button>
        </Tooltip>
        <Tooltip title="快捷键 N">
          <Button
            danger
            icon={<CloseOutlined />}
            loading={submitting}
            onClick={() => setApproving({ record, type: 'reject' })}
          >
            驳回 (N)
          </Button>
        </Tooltip>
        <span style={{ color: '#8c8c8c', marginLeft: 8 }}>↑/↓ 切换条目</span>
      </>
    );
  };

  // ============ 详情头(360 跳转) ============
  const renderHeader = (record: T) => {
    const residentId =
      (record as any).resident ?? (record as any).applicant ?? null;
    return (
      <Space size={16} align="center">
        <span style={{ fontSize: 16, fontWeight: 600 }}>
          申请单 #{String(record.id).slice(-6)}
        </span>
        {residentId ? (
          <ResidentLink id={String(residentId)}>
            <Button type="link" size="small">
              查看居民全貌 →
            </Button>
          </ResidentLink>
        ) : null}
      </Space>
    );
  };

  // ============ Y/N 快捷键 ============
  useKeyPress(
    ['y', 'Y'],
    (e) => {
      if (isInputFocus()) return;
      const sel = ctxRef.current?.selected;
      if (!sel || sel.status !== 'UNDER_APPROVAL') return;
      e.preventDefault();
      setApproving({ record: sel, type: 'approve' });
    },
    { exactMatch: false },
  );
  useKeyPress(
    ['n', 'N'],
    (e) => {
      if (isInputFocus()) return;
      const sel = ctxRef.current?.selected;
      if (!sel || sel.status !== 'UNDER_APPROVAL') return;
      e.preventDefault();
      setApproving({ record: sel, type: 'reject' });
    },
    { exactMatch: false },
  );

  // ============ 列表列 ============
  const columns: ColumnsType<T> = useMemo(
    () => [
      ...baseColumns,
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (status: any, record: any) => (
          <EnhancedTag
            color={(StatusColors.ApplicationStatus as any)[status]}
            label={
              EnumLabels.ApplicationStatus[
                status as keyof typeof EnumLabels.ApplicationStatus
              ] ?? status
            }
            context={{
              submittedAt: record.submittedAt,
              submittedBy: record.submittedBy,
              approver: record.approver,
              approvalTime: record.approvalTime,
              approvalOpinion: record.approvalOpinion,
            }}
          />
        ),
      },
      {
        title: '',
        key: 'rowMenu',
        width: 40,
        render: (_: any, record: T) => {
          const residentId =
            (record as any).resident ?? (record as any).applicant ?? null;
          return (
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  residentId && {
                    key: 'goto-resident',
                    label: '查看居民全貌',
                    onClick: () =>
                      window.open(`/residents/${residentId}`, '_blank'),
                  },
                  {
                    key: 'copy-id',
                    label: '复制申请编号',
                    onClick: () =>
                      navigator.clipboard
                        .writeText(record.id)
                        .then(() => message.success('已复制')),
                  },
                ].filter(Boolean) as any[],
              }}
            >
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          );
        },
      },
    ],
    [baseColumns],
  );

  return (
    <>
      <MasterDetailListPage<T>
        key={reloadKey}
        title={title}
        toolbar={
          <Space>
            <Select
              allowClear
              placeholder="状态筛选"
              style={{ width: 160 }}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              options={enumOptions(ApplicationStatus, EnumLabels.ApplicationStatus)}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => ctxRef.current?.reload()}
            >
              刷新
            </Button>
          </Space>
        }
        service={service}
        buildQuery={buildQuery}
        columns={columns}
        renderDetail={(record) => (renderDetail ? renderDetail(record) : null)}
        renderDetailHeader={(record) => renderHeader(record)}
        renderDetailActions={(record) => renderActions(record)}
        rowContextMenuItems={(record) => {
          const residentId =
            (record as any).resident ?? (record as any).applicant ?? null;
          return [
            residentId && {
              key: 'goto-resident',
              label: '查看居民全貌',
              onClick: () => window.open(`/residents/${residentId}`, '_blank'),
            },
            record.status === 'UNDER_APPROVAL' && {
              key: 'approve',
              label: '通过 (Y)',
              onClick: () => setApproving({ record, type: 'approve' }),
            },
            record.status === 'UNDER_APPROVAL' && {
              key: 'reject',
              label: '驳回 (N)',
              danger: true,
              onClick: () => setApproving({ record, type: 'reject' }),
            },
            { type: 'divider' },
            {
              key: 'copy-id',
              label: '复制申请编号',
              onClick: () =>
                navigator.clipboard
                  .writeText(record.id)
                  .then(() => message.success('已复制')),
            },
          ];
        }}
        storageKey={storageKey ?? `approval-${objectType}`}
        innerRef={ctxRef}
      />

      <Modal
        title={approving?.type === 'approve' ? '审批通过' : '审批驳回'}
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
            label={approving?.type === 'approve' ? '审批意见' : '驳回原因'}
            rules={
              approving?.type === 'reject'
                ? [{ required: true, message: '请填写驳回原因' }]
                : []
            }
          >
            <Input.TextArea rows={4} placeholder="请输入..." autoFocus />
          </Form.Item>
        </Form>
      </Modal>
    </>
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

export default ApprovalListPage;
