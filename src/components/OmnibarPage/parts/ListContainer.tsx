import React, { useMemo } from 'react';
import { Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { ToolbarAction } from '../types';
import ToolbarActions from './ToolbarActions';

export interface ListContainerProps<T> {
  /** 视图切换 radio,如「表头 / 表头+明细」 */
  viewModes?: { value: string; label: string }[];
  viewMode?: string;
  onViewModeChange?: (mode: string) => void;

  /** 工具栏右侧按钮 */
  toolbarActions?: ToolbarAction[];

  /** 数据 */
  data: T[];
  columns: ColumnsType<T>;
  loading?: boolean;
  rowKey?: string;

  /** 多选 */
  selectedKeys?: React.Key[];
  onSelectionChange?: (keys: React.Key[]) => void;
  showCheckbox?: boolean;
  /** 自动加序号列 */
  showIndex?: boolean;

  /** 行点击 */
  onRowClick?: (record: T) => void;

  /** 小计 / 合计 */
  subtotal?: React.ReactNode;
  grandtotal?: React.ReactNode;

  /** 透传给 antd Table 的 scroll */
  scroll?: TableProps<T>['scroll'];
}

function ListContainerInner<T extends Record<string, any>>(props: ListContainerProps<T>) {
  const {
    viewModes,
    viewMode,
    onViewModeChange,
    toolbarActions,
    data,
    columns,
    loading,
    rowKey = 'id',
    selectedKeys,
    onSelectionChange,
    showCheckbox = true,
    showIndex = true,
    onRowClick,
    subtotal,
    grandtotal,
    scroll,
  } = props;

  // 自动加序号列
  const finalColumns: ColumnsType<T> = useMemo(() => {
    if (!showIndex) return columns;
    const indexCol: ColumnsType<T>[number] = {
      title: '序号',
      key: '__index__',
      width: 60,
      align: 'center',
      render: (_v: any, _r: T, idx: number) => idx + 1,
    };
    return [indexCol, ...columns];
  }, [columns, showIndex]);

  return (
    <div className="opp-list-container">
      {/* 工具栏 */}
      {(viewModes || toolbarActions) && (
        <div className="opp-list-toolbar">
          <div className="opp-toolbar-left">
            {viewModes?.map((m) => (
              <label key={m.value} className="opp-view-radio">
                <input
                  type="radio"
                  name="opp-view-mode"
                  value={m.value}
                  checked={viewMode === m.value}
                  onChange={() => onViewModeChange?.(m.value)}
                />
                {m.label}
              </label>
            ))}
          </div>
          <div className="opp-toolbar-right">
            <ToolbarActions actions={toolbarActions} />
          </div>
        </div>
      )}

      {/* 表格 */}
      <div className="opp-list-table-wrap">
        <Table<T>
          rowKey={rowKey}
          size="middle"
          dataSource={data}
          columns={finalColumns}
          loading={loading}
          pagination={false}
          rowSelection={
            showCheckbox
              ? {
                  selectedRowKeys: selectedKeys,
                  onChange: (keys) => onSelectionChange?.(keys),
                }
              : undefined
          }
          onRow={(record) => ({
            onClick: () => onRowClick?.(record),
          })}
          scroll={scroll}
        />
      </div>

      {/* 小计 / 合计 */}
      {subtotal !== undefined && (
        <div className="opp-list-summary subtotal">
          <span className="opp-summary-label">小计</span>
          <span className="opp-summary-body">{subtotal}</span>
        </div>
      )}
      {grandtotal !== undefined && (
        <div className="opp-list-summary grandtotal">
          <span className="opp-summary-label">合计</span>
          <span className="opp-summary-body">{grandtotal}</span>
        </div>
      )}
    </div>
  );
}

const ListContainer = ListContainerInner as <T extends Record<string, any>>(
  props: ListContainerProps<T>,
) => React.ReactElement;

export default ListContainer;
