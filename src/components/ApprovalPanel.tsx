/**
 * 审批面板 — 详情页右侧工具栏内的审批操作 + 多级流程时间线
 *
 * 布局(参考原型):
 *   操作       —— 审批意见输入框
 *   [驳回][通过] —— 操作按钮(驳回必填意见)
 *   审批流程    —— 多级时间线,每步:状态圆点 + 时间 + 环节·审批人·状态 + 意见框
 *
 * 数据:approvalRecordService.listByBiz(B 轨多级记录),审批走 approvalService。
 */

import {
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { Button, Empty, Input, message, Space, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import {
  approvalRecordService,
  approvalService,
} from '@/services/domains/approval';
import type {
  ApprovalRecord,
  ApprovalRecordResult,
} from '@/types/ontology/prh/entities/approval_record';

export interface ApprovalPanelProps {
  /** 业务对象类型,如 OT.Leave */
  objectType: string;
  /** 单据 id */
  bizRef: string;
  /** 单据当前状态(UNDER_APPROVAL 才可操作) */
  status?: string;
  /** 审批完成后回调(刷新详情) */
  onApproved?: () => void;
}

const RESULT_META: Record<
  ApprovalRecordResult,
  { icon: React.ReactNode; color: string; text: string }
> = {
  PASS: { icon: <CheckCircleFilled />, color: '#52c41a', text: '审核通过' },
  REJECT: { icon: <CloseCircleFilled />, color: '#ff4d4f', text: '已驳回' },
  PENDING: { icon: <ClockCircleFilled />, color: '#faad14', text: '待审批' },
  NOT_CREATED: {
    icon: <MinusCircleOutlined />,
    color: '#bfbfbf',
    text: '流程未创建',
  },
};

const ApprovalPanel: React.FC<ApprovalPanelProps> = ({
  objectType,
  bizRef,
  status,
  onApproved,
}) => {
  const [records, setRecords] = useState<ApprovalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [opinion, setOpinion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!bizRef) return;
    setLoading(true);
    try {
      const list = await approvalRecordService.listByBiz(objectType, bizRef);
      setRecords(list);
    } finally {
      setLoading(false);
    }
  }, [objectType, bizRef]);

  useEffect(() => {
    load();
  }, [load]);

  const canOperate = status === 'UNDER_APPROVAL';

  const handle = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !opinion.trim()) {
      message.warning('驳回操作必须填写审批意见');
      return;
    }
    setSubmitting(true);
    try {
      if (action === 'approve') {
        await approvalService.approve(objectType, bizRef, opinion.trim());
        message.success('已通过');
      } else {
        await approvalService.reject(objectType, bizRef, opinion.trim());
        message.success('已驳回');
      }
      setOpinion('');
      await load();
      onApproved?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* 操作区 */}
      <div>
        <div className="ap-panel-label">操作</div>
        <Input.TextArea
          rows={3}
          value={opinion}
          onChange={(e) => setOpinion(e.target.value)}
          placeholder="请填写审批意见，驳回操作必填！"
          disabled={!canOperate}
        />
        <Space style={{ marginTop: 12 }}>
          <Button
            danger
            disabled={!canOperate}
            loading={submitting}
            onClick={() => handle('reject')}
          >
            驳回
          </Button>
          <Button
            type="primary"
            disabled={!canOperate}
            loading={submitting}
            onClick={() => handle('approve')}
          >
            通过
          </Button>
        </Space>
        {!canOperate && (
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: 'var(--ant-color-text-tertiary)',
            }}
          >
            当前状态不可审批
          </div>
        )}
      </div>

      {/* 审批流程时间线 */}
      <div>
        <div className="ap-panel-label" style={{ marginBottom: 12 }}>
          审批流程
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin />
          </div>
        ) : records.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无审批流程"
          />
        ) : (
          <div className="ap-timeline">
            {records.map((r, idx) => {
              const meta = RESULT_META[r.result] ?? RESULT_META.NOT_CREATED;
              const isLast = idx === records.length - 1;
              return (
                <div key={r.id} className="ap-timeline-item">
                  <div className="ap-timeline-rail">
                    <span
                      className="ap-timeline-dot"
                      style={{ color: meta.color }}
                    >
                      {meta.icon}
                    </span>
                    {!isLast && <span className="ap-timeline-line" />}
                  </div>
                  <div className="ap-timeline-body">
                    {r.approvalTime && (
                      <div className="ap-timeline-time">
                        {new Date(r.approvalTime).toLocaleString()}
                      </div>
                    )}
                    <div className="ap-timeline-title">
                      {r.stepName}
                      {r.approverName ? ` - ${r.approverName}` : ''}
                      <span style={{ color: meta.color }}>（{meta.text}）</span>
                    </div>
                    {r.opinion && (
                      <div className="ap-timeline-opinion">{r.opinion}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalPanel;
