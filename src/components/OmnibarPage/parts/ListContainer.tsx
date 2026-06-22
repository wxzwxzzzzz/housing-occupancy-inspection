import { Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { formatDate, formatDateTime, isDateField } from '@/utils/format';
import type { ToolbarAction } from '../types';
import ToolbarActions from './ToolbarActions';

/** 纯日期字段(只到天)用 formatDate,其余时间字段用 formatDateTime */
const DATE_ONLY_FIELDS = new Set([
  'startDate',
  'endDate',
  'effectiveDate',
  'missedDate',
  'archiveDate',
  'reviewStartDate',
  'reviewEndDate',
  'birthDate',
  'effectiveFrom',
  'joinedAt',
  'joinAt',
]);

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

  /** 底部 footer(分页等)。渲染在卡片内部,贴合原型 .list-container > .list-footer 结构 */
  footer?: React.ReactNode;

  /** 透传给 antd Table 的 scroll */
  scroll?: TableProps<T>['scroll'];
}

function ListContainerInner<T extends Record<string, any>>(
  props: ListContainerProps<T>,
) {
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
    footer,
    scroll,
  } = props;

  // 自动加序号列 + 时间列自动格式化(无自定义 render 且 dataIndex 命中时间字段)
  const finalColumns: ColumnsType<T> = useMemo(() => {
    const autoFmt = columns.map((col) => {
      const anyCol = col as any;
      const di = anyCol.dataIndex;
      if (typeof di === 'string' && !anyCol.render && isDateField(di)) {
        return {
          ...anyCol,
          render: (v: any) =>
            DATE_ONLY_FIELDS.has(di) ? formatDate(v) : formatDateTime(v),
        };
      }
      return col;
    });
    if (!showIndex) return autoFmt;
    const indexCol: ColumnsType<T>[number] = {
      title: '序号',
      key: '__index__',
      width: 40,
      align: 'center',
      render: (_v: any, _r: T, idx: number) => idx + 1,
    };
    return [indexCol, ...autoFmt];
  }, [columns, showIndex]);

  // 固定表头:用 antd 原生 scroll.y(表头/表体拆成两个 table,表头不参与滚动)。
  // 自动测量 .opp-list-table-wrap 可用高度,减去表头 32px,得到表体可滚动高度。
  // 若调用方已显式传入 scroll.y,则尊重调用方,不自动测量。
  const wrapRef = useRef<HTMLDivElement>(null);
  const [bodyHeight, setBodyHeight] = useState<number>();
  const userScrollY = scroll?.y;

  useEffect(() => {
    if (userScrollY !== undefined) return; // 调用方自定义了高度
    const el = wrapRef.current;
    if (!el) return;
    const HEADER_H = 32; // 与 .opp-card-table-skin() 表头高度一致
    const measure = () => {
      const h = el.clientHeight - HEADER_H;
      setBodyHeight(h > 0 ? h : undefined);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [userScrollY]);

  const effectiveScroll: TableProps<T>['scroll'] =
    userScrollY !== undefined
      ? scroll
      : { ...scroll, y: bodyHeight };

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
      <div className="opp-list-table-wrap" ref={wrapRef}>
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
                  columnWidth: 40,
                  selectedRowKeys: selectedKeys,
                  onChange: (keys) => onSelectionChange?.(keys),
                }
              : undefined
          }
          onRow={(record) => ({
            onClick: () => onRowClick?.(record),
          })}
          scroll={effectiveScroll}
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

      {/* 底部 footer(分页) —— 原型中属于 .list-container 卡片内部最后一行 */}
      {footer}
    </div>
  );
}

const ListContainer = ListContainerInner as <T extends Record<string, any>>(
  props: ListContainerProps<T>,
) => React.ReactElement;

export default ListContainer;
