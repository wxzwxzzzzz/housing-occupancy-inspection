/**
 * 主从布局列表页(Master-Detail)— PC 大屏专属
 *
 * 设计目标:
 *  - 列表(40%)+ 详情(60%)分栏常驻,选中行右侧自动展示详情,免去"跳详情 → 返回"
 *  - 键盘 ↑/↓ 切换行,Esc 取消选中
 *  - 分栏比例可拖拽,持久化到 localStorage
 *
 * 使用方:
 *   <MasterDetailListPage
 *     title="请假审批"
 *     service={leaveService}
 *     buildQuery={() => qb(OT.Leave).orderBy('createAt', 'DESC').page(1, 20).build()}
 *     columns={[...]}
 *     renderDetail={(record) => <LeaveDetailPanel record={record} />}
 *     renderActions={(record, ctx) => <Space>...</Space>}
 *   />
 */

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Card, Empty, Space, Table } from 'antd';
import { useKeyPress } from 'ahooks';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { EntityApi } from '@/services/ontology/crud';
import type { QuerySpec } from '@/types/ontology/ap/oql/query_spec';

const SPLIT_MIN = 0.25;
const SPLIT_MAX = 0.65;
const SPLIT_DEFAULT = 0.4;

export interface MasterDetailContext<T> {
  /** 重新拉取列表 */
  reload: () => Promise<void>;
  /** 切换到下一行(列表底则保持) */
  selectNext: () => void;
  /** 切换到上一行 */
  selectPrev: () => void;
  /** 当前选中记录 */
  selected: T | null;
}

export interface MasterDetailListPageProps<T extends { id: string }> {
  title?: React.ReactNode;
  /** 顶部工具栏(筛选条件、新建按钮等) */
  toolbar?: React.ReactNode;
  /** 顶部统计区(可选) */
  topStats?: React.ReactNode;
  /** 实体 service */
  service: EntityApi<T>;
  /** 构造查询条件,变更时会重新拉取(用 useMemo/useCallback 保持稳定) */
  buildQuery: () => QuerySpec | Omit<QuerySpec, 'objectType'>;
  /** 列表列(精简版,2~4 列) */
  columns: ColumnsType<T>;
  /** 详情区渲染 */
  renderDetail: (record: T, ctx: MasterDetailContext<T>) => React.ReactNode;
  /** 详情区头部(标题/操作) */
  renderDetailHeader?: (record: T, ctx: MasterDetailContext<T>) => React.ReactNode;
  /** 详情区底部操作栏(审批/通过/驳回等) */
  renderDetailActions?: (record: T, ctx: MasterDetailContext<T>) => React.ReactNode;
  /** 列表行右键菜单 items 构造器 */
  rowContextMenuItems?: (
    record: T,
    ctx: MasterDetailContext<T>,
  ) => Array<any>;
  /** 选中变化回调 */
  onSelect?: (record: T | null) => void;
  /** 分栏比例 localStorage key,不传则不持久化 */
  storageKey?: string;
  /** 默认分栏比例(列表所占),0~1 */
  defaultSplit?: number;
  /** 是否启用 ↑↓ 键盘切换,默认 true */
  enableKeyboard?: boolean;
  /** 列表区高度,默认 calc(100vh - 240px) */
  height?: number | string;
  /** 是否在加载完成后自动选中第一行,默认 true */
  autoSelectFirst?: boolean;

  /** 暴露给父组件的引用 */
  innerRef?: React.Ref<MasterDetailContext<T>>;
}

export function MasterDetailListPage<T extends { id: string }>(
  props: MasterDetailListPageProps<T>,
) {
  const {
    title,
    toolbar,
    topStats,
    service,
    buildQuery,
    columns,
    renderDetail,
    renderDetailHeader,
    renderDetailActions,
    rowContextMenuItems,
    onSelect,
    storageKey,
    defaultSplit = SPLIT_DEFAULT,
    enableKeyboard = true,
    height = 'calc(100vh - 220px)',
    autoSelectFirst = true,
    innerRef,
  } = props;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<T | null>(null);
  const [split, setSplit] = useState<number>(() => {
    if (!storageKey) return defaultSplit;
    try {
      const v = localStorage.getItem(`md-split:${storageKey}`);
      if (v) {
        const n = parseFloat(v);
        if (!Number.isNaN(n) && n >= SPLIT_MIN && n <= SPLIT_MAX) return n;
      }
    } catch {}
    return defaultSplit;
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const buildQueryRef = useRef(buildQuery);
  buildQueryRef.current = buildQuery;

  const load = useCallback(
    async (page = pageNo, size = pageSize) => {
      setLoading(true);
      try {
        const spec = buildQueryRef.current() as QuerySpec;
        // 注入分页(允许调用方覆盖)
        const finalSpec = {
          ...spec,
          page: spec.page ?? { pageNo: page, pageSize: size },
        };
        const env = await service.list(finalSpec as any);
        setData(env.data);
        setTotal(env.page?.total ?? env.data.length);
        // 自动选中第一行
        if (autoSelectFirst) {
          setSelected((prev) => {
            if (prev && env.data.find((d) => d.id === prev.id)) return prev;
            return env.data[0] ?? null;
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [service, pageNo, pageSize, autoSelectFirst],
  );

  useEffect(() => {
    load(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onSelect?.(selected);
  }, [selected, onSelect]);

  // ---------- 键盘上下切换 ----------
  const selectByOffset = useCallback(
    (offset: number) => {
      if (!data.length) return;
      const idx = selected ? data.findIndex((d) => d.id === selected.id) : -1;
      const next = Math.max(0, Math.min(data.length - 1, idx + offset));
      setSelected(data[next]);
      // 滚动列表使选中行可见
      requestAnimationFrame(() => {
        const el = containerRef.current?.querySelector<HTMLElement>(
          `tr[data-row-key="${data[next].id}"]`,
        );
        el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    },
    [data, selected],
  );

  useKeyPress(
    'downarrow',
    (e) => {
      if (!enableKeyboard) return;
      if (isInputFocus()) return;
      e.preventDefault();
      selectByOffset(1);
    },
    { exactMatch: true },
  );
  useKeyPress(
    'uparrow',
    (e) => {
      if (!enableKeyboard) return;
      if (isInputFocus()) return;
      e.preventDefault();
      selectByOffset(-1);
    },
    { exactMatch: true },
  );
  useKeyPress(
    'esc',
    () => {
      if (!enableKeyboard) return;
      setSelected(null);
    },
    { exactMatch: true },
  );

  // ---------- 分栏拖拽 ----------
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(`md-split:${storageKey}`, String(split));
    } catch {}
  }, [split, storageKey]);

  const handleDragStart = useCallback(() => {
    draggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      if (ratio >= SPLIT_MIN && ratio <= SPLIT_MAX) setSplit(ratio);
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // ---------- ctx ----------
  const ctx: MasterDetailContext<T> = useMemo(
    () => ({
      reload: () => load(),
      selectNext: () => selectByOffset(1),
      selectPrev: () => selectByOffset(-1),
      selected,
    }),
    [load, selectByOffset, selected],
  );

  useImperativeHandle(innerRef, () => ctx, [ctx]);

  const onRow: TableProps<T>['onRow'] = (record) => ({
    onClick: () => setSelected(record),
    onContextMenu: (e) => {
      if (!rowContextMenuItems) return;
      const items = rowContextMenuItems(record, ctx).filter(Boolean);
      if (items.length === 0) return;
      e.preventDefault();
      setSelected(record);
      // 浮出菜单
      showLightContextMenu(e.clientX, e.clientY, items);
    },
  });

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 16,
        height: '100%',
      }}
    >
      {topStats}

      {(title || toolbar) && (
        <Card
          size="small"
          styles={{
            header: { minHeight: 44, padding: '0 16px' },
            body: {
              padding: toolbar ? '14px 16px 12px' : 0,
              display: toolbar ? 'block' : 'none',
            },
          }}
          title={title}
        >
          {toolbar}
        </Card>
      )}

      <div
        style={{
          display: 'flex',
          gap: 12,
          flex: 1,
          minHeight: 0,
          height,
        }}
      >
        {/* 左:列表 */}
        <Card
          size="small"
          style={{ width: `calc(${split * 100}% - 6px)`, display: 'flex', flexDirection: 'column' }}
          styles={{
            body: {
              padding: 0,
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          }}
        >
          <Table<T>
            rowKey="id"
            size="middle"
            columns={columns}
            dataSource={data}
            loading={loading}
            sticky
            scroll={{ y: 'calc(100% - 56px)' }}
            rowClassName={(r) =>
              selected?.id === r.id ? 'master-list-row-selected' : ''
            }
            onRow={onRow}
            pagination={{
              current: pageNo,
              pageSize,
              total,
              size: 'small',
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (p, s) => {
                setPageNo(p);
                setPageSize(s);
                load(p, s);
              },
            }}
            style={{ flex: 1 }}
          />
          {/* 隐藏占位:语义化容器,不渲染实际内容 */}
        </Card>

        {/* 中:可拖拽分隔条 */}
        <div
          onMouseDown={handleDragStart}
          style={{
            width: 6,
            cursor: 'col-resize',
            background: 'transparent',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: 2,
              background: '#f0f0f0',
              transform: 'translateX(-50%)',
            }}
          />
        </div>

        {/* 右:详情 */}
        <Card
          size="small"
          style={{
            width: `calc(${(1 - split) * 100}% - 6px)`,
            display: 'flex',
            flexDirection: 'column',
          }}
          styles={{
            body: {
              padding: 0,
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          }}
        >
          {selected ? (
            <>
              {renderDetailHeader && (
                <div
                  style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid #f0f0f0',
                    flexShrink: 0,
                  }}
                >
                  {renderDetailHeader(selected, ctx)}
                </div>
              )}
              <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
                {renderDetail(selected, ctx)}
              </div>
              {renderDetailActions && (
                <div
                  style={{
                    padding: '12px 20px',
                    borderTop: '1px solid #f0f0f0',
                    flexShrink: 0,
                    background: '#fafafa',
                  }}
                >
                  <Space>{renderDetailActions(selected, ctx)}</Space>
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Empty description="选择左侧列表查看详情(↑↓ 切换)" />
            </div>
          )}
        </Card>
      </div>
    </div>
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

// ---------- 轻量右键菜单(原生 DOM) ----------
let _ctxNode: HTMLDivElement | null = null;
function showLightContextMenu(x: number, y: number, items: any[]) {
  hideLightContextMenu();
  if (!_ctxNode) {
    _ctxNode = document.createElement('div');
    _ctxNode.style.position = 'fixed';
    _ctxNode.style.zIndex = '2000';
    document.body.appendChild(_ctxNode);
  }
  const menu = document.createElement('div');
  menu.style.cssText = `
    position: fixed;
    left: ${x}px; top: ${y}px;
    min-width: 160px;
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    padding: 4px;
    font-size: 14px;
    user-select: none;
  `;
  items.forEach((item: any, i) => {
    if (!item) return;
    if (item.type === 'divider') {
      const div = document.createElement('div');
      div.style.cssText = 'border-top:1px solid #f0f0f0;margin:4px 0';
      menu.appendChild(div);
      return;
    }
    const it = document.createElement('div');
    it.textContent = String(item.label ?? '');
    it.style.cssText = `padding:6px 12px;cursor:pointer;border-radius:4px;${item.danger ? 'color:#ff4d4f;' : ''}`;
    it.addEventListener('mouseenter', () => {
      it.style.background = '#f5f5f5';
    });
    it.addEventListener('mouseleave', () => {
      it.style.background = 'transparent';
    });
    it.addEventListener('click', () => {
      try {
        item.onClick?.({ key: String(item.key ?? i) });
      } finally {
        hideLightContextMenu();
      }
    });
    menu.appendChild(it);
  });
  _ctxNode.appendChild(menu);
  // 边界纠正
  setTimeout(() => {
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${Math.max(0, x - rect.width)}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${Math.max(0, y - rect.height)}px`;
    }
  }, 0);
  const off = (e: MouseEvent | KeyboardEvent) => {
    if (e instanceof KeyboardEvent && e.key !== 'Escape') return;
    hideLightContextMenu();
  };
  setTimeout(() => {
    window.addEventListener('mousedown', off as any, { once: true });
    window.addEventListener('keydown', off as any, { once: true });
  }, 0);
}
function hideLightContextMenu() {
  if (!_ctxNode) return;
  while (_ctxNode.firstChild) _ctxNode.removeChild(_ctxNode.firstChild);
}

export default MasterDetailListPage;
