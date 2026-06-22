import React, { useState } from 'react';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { FilterConfig, ToolbarAction } from './types';
import QueryPanel from './parts/QueryPanel';
import ListContainer from './parts/ListContainer';
import ListFooter from './parts/ListFooter';
import './OmnibarPage.less';

export interface OmnibarListPageProps<T extends Record<string, any>> {
  // ============ 查询面板 ============
  filters?: FilterConfig[];
  filterValues?: Record<string, any>;
  onFilterChange?: (values: Record<string, any>) => void;
  onSearch?: (values: Record<string, any>) => void;
  /** 默认折叠状态 */
  defaultFilterCollapsed?: boolean;
  /** 当前查询方案名 */
  schemeName?: string;
  onSchemeClick?: () => void;

  // ============ 工具栏 ============
  viewModes?: { value: string; label: string }[];
  viewMode?: string;
  onViewModeChange?: (mode: string) => void;
  toolbarActions?: ToolbarAction[];

  // ============ 列表 ============
  data: T[];
  loading?: boolean;
  columns: ColumnsType<T>;
  rowKey?: string;
  selectedKeys?: React.Key[];
  onSelectionChange?: (keys: React.Key[]) => void;
  showCheckbox?: boolean;
  showIndex?: boolean;
  onRowClick?: (record: T) => void;
  scroll?: TableProps<T>['scroll'];

  // ============ 小计 / 合计 ============
  subtotal?: React.ReactNode;
  grandtotal?: React.ReactNode;

  // ============ 分页 / Footer ============
  total: number;
  page: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number, pageSize: number) => void;
  showOnlySelected?: boolean;
  onShowOnlySelectedChange?: (v: boolean) => void;

  /** 不显示 Footer(只在不需要分页时关闭) */
  hideFooter?: boolean;

  /** 顶部插槽(QueryPanel 之上) — 放 topStats / 自定义统计卡 */
  topSlot?: React.ReactNode;
  /** 底部插槽(Footer 之下) — 预留 */
  bottomSlot?: React.ReactNode;
}

function OmnibarListPageInner<T extends Record<string, any>>(props: OmnibarListPageProps<T>) {
  const {
    filters,
    filterValues = {},
    onFilterChange,
    onSearch,
    defaultFilterCollapsed = false,
    schemeName,
    onSchemeClick,

    viewModes,
    viewMode,
    onViewModeChange,
    toolbarActions,

    data,
    loading,
    columns,
    rowKey,
    selectedKeys = [],
    onSelectionChange,
    showCheckbox,
    showIndex,
    onRowClick,
    scroll,

    subtotal,
    grandtotal,

    total,
    page,
    pageSize,
    pageSizeOptions,
    onPageChange,
    showOnlySelected,
    onShowOnlySelectedChange,

    hideFooter,

    topSlot,
    bottomSlot,
  } = props;

  const [collapsed, setCollapsed] = useState(defaultFilterCollapsed);

  return (
    <div className="omnibar-page">
      {topSlot && <div className="opp-top-slot">{topSlot}</div>}
      {filters && filters.length > 0 && (
        <QueryPanel
          filters={filters}
          values={filterValues}
          onChange={(v) => onFilterChange?.(v)}
          onSearch={() => onSearch?.(filterValues)}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          schemeName={schemeName}
          onSchemeClick={onSchemeClick}
        />
      )}

      <ListContainer<T>
        viewModes={viewModes}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        toolbarActions={toolbarActions}
        data={data}
        columns={columns}
        loading={loading}
        rowKey={rowKey}
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectionChange}
        showCheckbox={showCheckbox}
        showIndex={showIndex}
        onRowClick={onRowClick}
        scroll={scroll}
        subtotal={subtotal}
        grandtotal={grandtotal}
        footer={
          !hideFooter && (
            <ListFooter
              selectedCount={selectedKeys.length}
              showOnlySelected={showOnlySelected}
              onShowOnlySelectedChange={onShowOnlySelectedChange}
              total={total}
              page={page}
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              onPageChange={onPageChange}
            />
          )
        }
      />

      {bottomSlot && <div className="opp-bottom-slot">{bottomSlot}</div>}
    </div>
  );
}

const OmnibarListPage = OmnibarListPageInner as <T extends Record<string, any>>(
  props: OmnibarListPageProps<T>,
) => React.ReactElement;

export default OmnibarListPage;
