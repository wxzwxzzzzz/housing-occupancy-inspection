/**
 * 状态流程面板 — 状态机类实体(补贴/配租)详情页右侧工具栏内的生命周期展示
 *
 * 与审批面板(ApprovalPanel)区别:
 *   - 审批面板:审批流(通过/驳回操作 + 审批记录)
 *   - 流程面板:状态机生命周期(只读展示,当前状态高亮)
 *
 * 节点状态计算:
 *   done    — 已经过的主流程节点(置灰 + 勾)
 *   current — 当前所处节点(主色高亮)
 *   future  — 尚未到达的主流程节点(虚线灰)
 *   branch  — 分支/终态(暂停/终止/到期,按是否命中当前状态着色)
 */

import {
  CheckCircleFilled,
  ClockCircleFilled,
  MinusCircleOutlined,
  StopFilled,
} from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { lifecyclePanelStore } from '@/stores';
import { dictLabel } from '@/stores/dictStore';

type NodeState = 'done' | 'current' | 'future' | 'branch-hit' | 'branch-idle';

const STATE_META: Record<
  NodeState,
  { icon: React.ReactNode; color: string }
> = {
  done: { icon: <CheckCircleFilled />, color: '#52c41a' },
  current: { icon: <ClockCircleFilled />, color: 'var(--ant-color-primary)' },
  future: { icon: <MinusCircleOutlined />, color: '#bfbfbf' },
  'branch-hit': { icon: <StopFilled />, color: '#ff4d4f' },
  'branch-idle': { icon: <MinusCircleOutlined />, color: '#d9d9d9' },
};

const LifecyclePanel: React.FC = observer(() => {
  const { steps, currentStatus, title, dictName } = lifecyclePanelStore;

  // 主流程节点的顺序索引(用于判断 done/current/future)
  const mainSteps = steps.filter((s) => s.kind !== 'branch' && s.kind !== 'terminal');
  const currentMainIdx = mainSteps.findIndex((s) => s.status === currentStatus);

  const nodeStateOf = (step: typeof steps[number]): NodeState => {
    if (step.kind === 'branch' || step.kind === 'terminal') {
      return step.status === currentStatus ? 'branch-hit' : 'branch-idle';
    }
    const idx = mainSteps.findIndex((s) => s.status === step.status);
    if (step.status === currentStatus) return 'current';
    // 如果当前在某个分支/终态,主流程按"是否在该终态之前"判断
    if (currentMainIdx === -1) {
      // 当前状态是分支/终态:主流程节点都算已过
      return 'done';
    }
    return idx < currentMainIdx ? 'done' : 'future';
  };

  return (
    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div className="ap-panel-label">{title ?? '状态流程'}</div>
        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: 'var(--ant-color-text-tertiary)',
          }}
        >
          当前状态:
          <span
            style={{
              color: 'var(--ant-color-primary)',
              fontWeight: 600,
              marginLeft: 4,
            }}
          >
            {currentStatus
              ? dictName
                ? dictLabel(dictName as any, currentStatus)
                : currentStatus
              : '-'}
          </span>
        </div>
      </div>

      <div className="ap-timeline">
        {steps.map((step, idx) => {
          const ns = nodeStateOf(step);
          const meta = STATE_META[ns];
          const isLast = idx === steps.length - 1;
          return (
            <div key={step.status} className="ap-timeline-item">
              <div className="ap-timeline-rail">
                <span className="ap-timeline-dot" style={{ color: meta.color }}>
                  {meta.icon}
                </span>
                {!isLast && (
                  <span
                    className="ap-timeline-line"
                    style={
                      ns === 'future' || ns === 'branch-idle'
                        ? { background: 'transparent', borderLeft: '2px dashed #e0e0e0' }
                        : undefined
                    }
                  />
                )}
              </div>
              <div className="ap-timeline-body">
                <div
                  className="ap-timeline-title"
                  style={{
                    color:
                      ns === 'current'
                        ? 'var(--ant-color-primary)'
                        : ns === 'branch-idle' || ns === 'future'
                          ? 'var(--ant-color-text-tertiary)'
                          : 'var(--ant-color-text)',
                    fontWeight: ns === 'current' ? 600 : 400,
                  }}
                >
                  {step.label}
                  {ns === 'current' && (
                    <span style={{ fontSize: 12, marginLeft: 6 }}>（当前）</span>
                  )}
                </div>
                {step.desc && (
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--ant-color-text-tertiary)',
                      marginTop: 2,
                    }}
                  >
                    {step.desc}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default LifecyclePanel;
