import React from 'react';
import { Pagination, Switch } from 'antd';

export interface ListFooterProps {
  selectedCount: number;
  showOnlySelected?: boolean;
  onShowOnlySelectedChange?: (v: boolean) => void;

  total: number;
  page: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number, pageSize: number) => void;
}

const ListFooter: React.FC<ListFooterProps> = ({
  selectedCount,
  showOnlySelected,
  onShowOnlySelectedChange,
  total,
  page,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
}) => {
  return (
    <div className="opp-list-footer">
      <div className="opp-footer-left">
        <span className="opp-only-selected">
          <Switch
            size="small"
            checked={!!showOnlySelected}
            onChange={(v) => onShowOnlySelectedChange?.(v)}
          />
          已选 <strong style={{ color: 'var(--ant-color-primary, #066fd1)' }}>{selectedCount}</strong> 行
        </span>
      </div>
      <div className="opp-footer-right">
        <span className="opp-page-total">共 {total} 条</span>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          size="small"
          showSizeChanger
          showQuickJumper
          pageSizeOptions={pageSizeOptions.map(String)}
          onChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default ListFooter;
