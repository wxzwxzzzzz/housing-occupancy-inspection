import React from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { StatusBadge, ToolbarAction } from '../types';
import ToolbarActions from './ToolbarActions';

export interface DetailHeaderProps {
  title: React.ReactNode;
  statusBadge?: StatusBadge;
  onBack?: () => void;
  backLabel?: string;
  actions?: ToolbarAction[];
}

const DetailHeader: React.FC<DetailHeaderProps> = ({
  title,
  statusBadge,
  onBack,
  backLabel = '返回',
  actions,
}) => {
  return (
    <div className="opp-detail-header">
      <div className="opp-detail-header-left">
        {onBack && (
          <button type="button" className="opp-back-btn" onClick={onBack}>
            <ArrowLeftOutlined />
            {backLabel}
          </button>
        )}
        <span className="opp-detail-title">{title}</span>
        {statusBadge && (
          <span className={`opp-status-badge ${statusBadge.color ?? 'secondary'}`}>
            {statusBadge.text}
          </span>
        )}
      </div>
      <div className="opp-detail-header-right">
        <ToolbarActions actions={actions} />
      </div>
    </div>
  );
};

export default DetailHeader;
