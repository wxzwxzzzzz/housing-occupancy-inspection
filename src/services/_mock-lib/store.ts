/**
 * Mock 内存存储 — 模拟"数据库"
 *
 * 进程内 Map<objectType, Record<id, object>>,
 * dev server 重启会重新种子,刷新浏览器不丢。
 *
 * 全部业务都通过 store.list/detail/insert/update/remove/applyFilter 操作,
 * 各 handler 不直接持有数据。
 */

import type { QueryFilterCondition } from '../../types/ontology/ap/oql/query_filter_condition';
import type { QueryFilterGroup } from '../../types/ontology/ap/oql/query_filter_group';
import type { QueryPage } from '../../types/ontology/ap/oql/query_page';
import type { QuerySortItem } from '../../types/ontology/ap/oql/query_sort_item';
import type { QuerySpec } from '../../types/ontology/ap/oql/query_spec';
import { aggregateRows } from './fact-aggregate';
import { factMetricRegistry } from './fact-metric-registry';

type Row = Record<string, any>;

const tables = new Map<string, Map<string, Row>>();
let seqCounter = 1;

export function nextId(prefix = 'id'): string {
  seqCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${seqCounter}`;
}

export function table(objectType: string): Map<string, Row> {
  let t = tables.get(objectType);
  if (!t) {
    t = new Map();
    tables.set(objectType, t);
  }
  return t;
}

export function reset(objectType?: string) {
  if (objectType) tables.delete(objectType);
  else tables.clear();
}

export function insert(objectType: string, payload: Row, options?: { id?: string }): Row {
  const id = options?.id ?? payload.id ?? nextId(simpleName(objectType));
  const now = new Date().toISOString();
  const row: Row = {
    ...payload,
    id,
    pubts: now,
    creator: payload.creator ?? 'system',
    createAt: payload.createAt ?? now,
    modifier: payload.modifier ?? 'system',
    modifyAt: payload.modifyAt ?? now,
    tenant: payload.tenant ?? 'default',
    dr: payload.dr ?? false,
  };
  table(objectType).set(id, row);
  return row;
}

export function update(objectType: string, id: string, patch: Row): Row | null {
  const t = table(objectType);
  const exist = t.get(id);
  if (!exist) return null;
  const now = new Date().toISOString();
  const next: Row = {
    ...exist,
    ...patch,
    id,
    modifier: patch.modifier ?? exist.modifier ?? 'system',
    modifyAt: now,
  };
  t.set(id, next);
  return next;
}

export function remove(objectType: string, id: string, logical = true): boolean {
  const t = table(objectType);
  const row = t.get(id);
  if (!row) return false;
  if (logical && 'dr' in row) {
    update(objectType, id, { dr: true });
  } else {
    t.delete(id);
  }
  return true;
}

export function findById(objectType: string, id: string): Row | undefined {
  return table(objectType).get(id);
}

export function findAll(objectType: string): Row[] {
  return Array.from(table(objectType).values());
}

// =============================================================================
// QuerySpec 执行器:filter / sort / page
// =============================================================================

export function applyQuery(objectType: string, spec: Partial<QuerySpec>): {
  data: Row[];
  page: { pageNo: number; pageSize: number; total: number };
} {
  let rows = findAll(objectType);

  if (spec.filter) {
    rows = rows.filter((row) => evalGroup(spec.filter!, row));
  }

  // Fact 聚合:spec 带 metrics 时,按 dimensions 分组 + 计算 metrics
  // (模拟 SEMANTIC_MODEL;真实后端返回已聚合结果)
  if (spec.metrics) {
    const registry = factMetricRegistry[objectType];
    if (registry) {
      const groupKeys = String(spec.dimensions ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const metricKeys = String(spec.metrics)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      rows = aggregateRows(rows, groupKeys, metricKeys, registry);
    }
  }

  if (spec.sortItems && spec.sortItems.length > 0) {
    rows = [...rows].sort((a, b) => compareRows(a, b, spec.sortItems!));
  }

  const total = rows.length;
  const page = spec.page ?? { pageNo: 1, pageSize: 20 };
  const pageNo = page.pageNo ?? 1;
  const pageSize = page.pageSize ?? 20;
  const start = (pageNo - 1) * pageSize;
  const end = start + pageSize;
  const sliced = rows.slice(start, end);

  return {
    data: sliced,
    page: { pageNo, pageSize, total },
  };
}

function evalGroup(group: QueryFilterGroup, row: Row): boolean {
  const op = group.operator || 'AND';
  const cond = group.conditions ?? [];
  const subs = group.groups ?? [];

  const condResults = cond.map((c) => evalCondition(c, row));
  const subResults = subs.map((g) => evalGroup(g, row));
  const all = [...condResults, ...subResults];
  if (all.length === 0) return true;

  return op === 'AND' ? all.every(Boolean) : all.some(Boolean);
}

function evalCondition(c: QueryFilterCondition, row: Row): boolean {
  const actual = readPath(row, c.field);
  const v1 = c.value1;
  const v2 = c.value2;

  switch (c.operator) {
    case 'EQ':
      return looseEqual(actual, v1);
    case 'NE':
      return !looseEqual(actual, v1);
    case 'GT':
      return cmp(actual, v1) > 0;
    case 'GE':
      return cmp(actual, v1) >= 0;
    case 'LT':
      return cmp(actual, v1) < 0;
    case 'LE':
      return cmp(actual, v1) <= 0;
    case 'LIKE': {
      if (actual === undefined || actual === null) return false;
      const needle = String(v1 ?? '').toLowerCase();
      return String(actual).toLowerCase().includes(needle);
    }
    case 'IN': {
      const list = (c.values ?? []).map(String);
      return list.includes(String(actual));
    }
    case 'BETWEEN':
      return cmp(actual, v1) >= 0 && cmp(actual, v2) <= 0;
    case 'IS_NULL':
      return actual === undefined || actual === null;
    case 'NOT_NULL':
      return actual !== undefined && actual !== null;
    default:
      return false;
  }
}

function compareRows(a: Row, b: Row, sortItems: QuerySortItem[]): number {
  for (const item of sortItems) {
    const av = readPath(a, item.path);
    const bv = readPath(b, item.path);
    const c = cmp(av, bv);
    if (c !== 0) return item.direction === 'DESC' ? -c : c;
  }
  return 0;
}

function readPath(row: Row, path: string): any {
  if (!path.includes('.')) return row[path];
  return path.split('.').reduce<any>((acc, key) => (acc == null ? acc : acc[key]), row);
}

function looseEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a === 'boolean' || typeof b === 'boolean') {
    return String(a) === String(b);
  }
  return String(a) === String(b);
}

function cmp(a: any, b: any): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  const an = typeof a === 'number' ? a : Number(a);
  const bn = typeof b === 'number' ? b : Number(b);
  if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
  return String(a).localeCompare(String(b));
}

function simpleName(objectType: string): string {
  const i = objectType.lastIndexOf('.');
  return (i >= 0 ? objectType.slice(i + 1) : objectType).toLowerCase();
}

/** 调试用 */
export function dump() {
  const result: Record<string, number> = {};
  tables.forEach((t, k) => {
    result[k] = t.size;
  });
  return result;
}

export function _internal_pagedDefaults(page?: QueryPage): { pageNo: number; pageSize: number } {
  return {
    pageNo: page?.pageNo ?? 1,
    pageSize: page?.pageSize ?? 20,
  };
}
