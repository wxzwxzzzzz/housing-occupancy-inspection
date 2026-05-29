/**
 * 通用 Fact 报表页 — 用 OQL 的 metrics + dimensions 直接出数。
 *
 * 设计要点:
 *  - 维度是行,指标是列;
 *  - 维度通过 `dimensions` prop 传入,会拼到 QuerySpec.dimensions;
 *  - 指标通过 `metrics` prop 传入,会拼到 QuerySpec.metrics;
 *  - 数据返回后用 `data[*][metric]` 渲染数值,`data[*][dim]` 渲染维度文本。
 *
 * 用法:
 *   <FactPage
 *     title="居民画像"
 *     factService={factService.residentSnapshot}
 *     dimensions={[
 *       { key: 'guaranteeType', label: '保障类型' },
 *       { key: 'residentStatus', label: '居民状态' },
 *     ]}
 *     metrics={[
 *       { key: 'residentCount', label: '居民数', format: 'integer' },
 *     ]}
 *   />
 */

import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type FilterConfig,
  OmnibarListPage,
  type ToolbarAction,
} from '@/components/OmnibarPage';
import type { EntityApi } from '@/services/ontology/crud';
import { qb } from '@/services/ontology/query';
import { dictStore } from '@/stores/dictStore';

export interface FactDimension {
  /** 维度字段名(对应 Fact class 上 isDimension="true" 的 attribute name) */
  key: string;
  /** 列头展示 */
  label: string;
  /** 行内值的格式化(默认直接 toString) */
  render?: (v: any, row: Record<string, any>) => React.ReactNode;
  width?: number;
  /**
   * 把该维度暴露为搜索项(维度本就是 XML 声明的可查询字段)。
   * 不填则该维度只用于分组展示,不进搜索栏。
   *  - 'enum'   下拉,需配 dictName 取选项
   *  - 'input'  关键字输入(LIKE)
   *  - 'date'   日期范围(BETWEEN,适合 timeGrain 维度)
   */
  search?: {
    type: 'enum' | 'input' | 'date';
    /** type='enum' 时,枚举名(对应 dictStore / EnumLabels 的 key) */
    dictName?: string;
    /** 比较算子,默认 enum→EQ / input→LIKE / date→BETWEEN */
    op?: 'EQ' | 'LIKE';
  };
}

export interface FactMetric {
  /** 指标字段名(对应 Fact class 上 isMetric="true" 的 attribute name) */
  key: string;
  /** 列头展示 */
  label: string;
  /** 显示格式 */
  format?: 'integer' | 'decimal' | 'currency' | 'percent';
  width?: number;
}

export interface FactPageProps {
  title: string;
  factService: EntityApi<Record<string, any>>;
  dimensions: FactDimension[];
  metrics: FactMetric[];
  /** 业务侧默认筛选项(如时间窗口) */
  filters?: FilterConfig[];
  /** 把过滤值翻译成 QueryBuilder 上的条件 */
  buildExtraQuery?: (
    builder: ReturnType<typeof qb>,
    values: Record<string, any>,
  ) => void;
  /** 默认筛选值 */
  defaultFilterValues?: Record<string, any>;
}

function formatMetric(v: any, format?: FactMetric['format']): React.ReactNode {
  if (v === undefined || v === null || v === '') return '-';
  const num = Number(v);
  if (Number.isNaN(num)) return v;
  switch (format) {
    case 'integer':
      return Math.round(num).toLocaleString();
    case 'decimal':
      return num.toFixed(2);
    case 'currency':
      return `¥${num.toFixed(2)}`;
    case 'percent':
      return `${(num * 100).toFixed(2)}%`;
    default:
      return num;
  }
}

const FactPage: React.FC<FactPageProps> = ({
  title,
  factService,
  dimensions,
  metrics,
  filters: extraFilters,
  buildExtraQuery,
  defaultFilterValues = {},
}) => {
  const [filterValues, setFilterValues] =
    useState<Record<string, any>>(defaultFilterValues);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const objectType = factService.objectType;

  /** 由带 search 标注的维度自动生成的搜索项 */
  const autoFilters = useMemo<FilterConfig[]>(
    () =>
      dimensions
        .filter((d) => d.search)
        .map<FilterConfig>((d) => {
          const s = d.search ?? { type: 'input' as const };
          if (s.type === 'enum') {
            return {
              key: d.key,
              label: d.label,
              type: 'select',
              options: s.dictName ? dictStore.options(s.dictName) : [],
              placeholder: `全部${d.label}`,
            };
          }
          if (s.type === 'date') {
            return { key: d.key, label: d.label, type: 'dateRange' };
          }
          return {
            key: d.key,
            label: d.label,
            type: 'input',
            placeholder: d.label,
          };
        }),
    [dimensions],
  );

  /** 自动搜索项 + 业务侧额外筛选项 */
  const mergedFilters = useMemo<FilterConfig[]>(
    () => [...autoFilters, ...(extraFilters ?? [])],
    [autoFilters, extraFilters],
  );

  /** 把维度搜索值拼进 OQL filter */
  const applyDimensionFilters = useCallback(
    (builder: ReturnType<typeof qb>, values: Record<string, any>) => {
      for (const d of dimensions) {
        if (!d.search) continue;
        const v = values[d.key];
        if (v === undefined || v === null || v === '') continue;
        if (d.search.type === 'enum') {
          builder.eq(d.key, v);
        } else if (d.search.type === 'input') {
          builder.like(d.key, String(v));
        } else if (d.search.type === 'date') {
          if (Array.isArray(v) && v[0] && v[1]) {
            const toIso = (x: any) =>
              typeof x?.toISOString === 'function'
                ? x.toISOString()
                : String(x);
            builder.between(d.key, toIso(v[0]), toIso(v[1]));
          }
        }
      }
    },
    [dimensions],
  );

  const load = useCallback(
    async (p = page, s = pageSize) => {
      setLoading(true);
      try {
        const builder = qb(objectType)
          .dimensions(dimensions.map((d) => d.key).join(','))
          .metrics(metrics.map((m) => m.key).join(','))
          .page(p, s);
        applyDimensionFilters(builder, filterValues);
        buildExtraQuery?.(builder, filterValues);
        const env = await factService.list(builder.build() as any);
        const rows = (env.data as Record<string, any>[]).map((row, idx) => ({
          ...row,
          _key: `${row.id ?? ''}_${idx}`,
        }));
        setData(rows);
        setTotal(env.page?.total ?? env.data.length);
      } finally {
        setLoading(false);
      }
    },
    [
      applyDimensionFilters,
      buildExtraQuery,
      dimensions,
      factService,
      filterValues,
      metrics,
      objectType,
      page,
      pageSize,
    ],
  );

  useEffect(() => {
    load(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filterValues)]);

  const toolbarActions: ToolbarAction[] = [
    {
      key: 'refresh',
      type: 'icon',
      icon: <ReloadOutlined />,
      title: '刷新',
      onClick: () => load(page, pageSize),
    },
  ];

  const columns: ColumnsType<Record<string, any>> = useMemo(
    () => [
      ...dimensions.map<ColumnsType<Record<string, any>>[number]>((d) => ({
        title: d.label,
        dataIndex: d.key,
        width: d.width ?? 140,
        render: d.render
          ? (v: any, row: Record<string, any>) => d.render!(v, row)
          : (v: any) =>
              v === null || v === undefined || v === '' ? '-' : String(v),
      })),
      ...metrics.map<ColumnsType<Record<string, any>>[number]>((m) => ({
        title: m.label,
        dataIndex: m.key,
        width: m.width ?? 120,
        align: 'right' as const,
        render: (v: any) => formatMetric(v, m.format),
      })),
    ],
    [dimensions, metrics],
  );

  return (
    <div style={{ height: '100%' }} data-fact-page={title}>
      <OmnibarListPage<Record<string, any>>
        filters={mergedFilters}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        onSearch={() => load(1, pageSize)}
        toolbarActions={toolbarActions}
        data={data}
        columns={columns}
        loading={loading}
        rowKey="_key"
        showIndex
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={(p, s) => {
          setPage(p);
          setPageSize(s);
          load(p, s);
        }}
      />
    </div>
  );
};

export default FactPage;
