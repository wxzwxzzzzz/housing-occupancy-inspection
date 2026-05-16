/**
 * 状态 Tag(增强版)
 *
 * - 渲染 antd Tag(颜色 + 文案)
 * - 鼠标 hover 显示状态相关上下文(提交时间/审批人/审批意见 等)
 * - 接收一个 record,自动从约定字段提取上下文
 */

import React from 'react';
import { Tag, Tooltip } from 'antd';

export interface EnhancedTagProps {
  color?: string;
  label: React.ReactNode;
  /** 触发 Tooltip 的额外信息 */
  context?: {
    submittedAt?: string;
    submittedBy?: string;
    approver?: string;
    approvalTime?: string;
    approvalOpinion?: string;
    [k: string]: any;
  };
}

const EnhancedTag: React.FC<EnhancedTagProps> = ({ color, label, context }) => {
  const lines: React.ReactNode[] = [];
  if (context?.submittedAt) {
    lines.push(
      <div key="s">
        提交于:{new Date(context.submittedAt).toLocaleString()}
        {context.submittedBy ? `(${context.submittedBy})` : ''}
      </div>,
    );
  }
  if (context?.approvalTime) {
    lines.push(
      <div key="a">
        审批于:{new Date(context.approvalTime).toLocaleString()}
        {context.approver ? `(${context.approver})` : ''}
      </div>,
    );
  }
  if (context?.approvalOpinion) {
    lines.push(<div key="o">意见:{context.approvalOpinion}</div>);
  }

  const tag = <Tag color={color}>{label}</Tag>;
  if (lines.length === 0) return tag;
  return (
    <Tooltip title={<div style={{ maxWidth: 280 }}>{lines}</div>}>{tag}</Tooltip>
  );
};

export default EnhancedTag;
