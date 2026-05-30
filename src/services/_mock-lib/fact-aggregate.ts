/**
 * Fact 聚合(mock 端模拟 SEMANTIC_MODEL 的 metrics 计算)
 *
 * 真实后端由本体语义模型按 expression 算 metrics;mock 网关原本不算,
 * 导致报表 metric 列全空。此处用一份"metricKey → 聚合描述符"注册表,
 * 在 applyQuery 检测到 spec.metrics 时,按分组维度 group by + 计算各 metric。
 *
 * 换真实后端(MOCK=none)后此文件不参与,后端返回已聚合结果。
 */

export type AggSpec =
  | { fn: 'count' }
  | { fn: 'countIf'; field: string; eq: string | string[] }
  | { fn: 'sum'; field: string; when?: { field: string; eq: string | string[] } }
  | { fn: 'avg'; field: string; when?: { field: string; eq: string | string[] } }
  | { fn: 'expr'; compute: (rows: Record<string, any>[]) => number | null };

type Row = Record<string, any>;

function matchEq(val: any, eq: string | string[]): boolean {
  const s = String(val);
  return Array.isArray(eq) ? eq.includes(s) : s === eq;
}

function computeMetric(spec: AggSpec, rows: Row[]): number | null {
  switch (spec.fn) {
    case 'count':
      return rows.length;
    case 'countIf':
      return rows.filter((r) => matchEq(r[spec.field], spec.eq)).length;
    case 'sum': {
      const src = spec.when
        ? rows.filter((r) => matchEq(r[spec.when!.field], spec.when!.eq))
        : rows;
      return src.reduce((a, r) => a + (Number(r[spec.field]) || 0), 0);
    }
    case 'avg': {
      const src = spec.when
        ? rows.filter((r) => matchEq(r[spec.when!.field], spec.when!.eq))
        : rows;
      if (src.length === 0) return 0;
      const sum = src.reduce((a, r) => a + (Number(r[spec.field]) || 0), 0);
      return Math.round((sum / src.length) * 100) / 100;
    }
    case 'expr':
      return spec.compute(rows);
    default:
      return null;
  }
}

/**
 * 按 groupKeys 分组,对每组算 metricKeys 的聚合值。
 * groupKeys 为空时返回单行汇总。
 */
export function aggregateRows(
  rows: Row[],
  groupKeys: string[],
  metricKeys: string[],
  registry: Record<string, AggSpec>,
): Row[] {
  const groups = new Map<string, Row[]>();
  if (groupKeys.length === 0) {
    groups.set('__all__', rows);
  } else {
    for (const r of rows) {
      const k = groupKeys.map((g) => String(r[g] ?? '')).join('||');
      const arr = groups.get(k);
      if (arr) arr.push(r);
      else groups.set(k, [r]);
    }
  }

  const out: Row[] = [];
  groups.forEach((groupRows) => {
    const row: Row = {};
    // 分组维度值(取该组第一行)
    for (const g of groupKeys) row[g] = groupRows[0]?.[g];
    // 各 metric
    for (const mk of metricKeys) {
      const spec = registry[mk];
      row[mk] = spec ? computeMetric(spec, groupRows) : null;
    }
    out.push(row);
  });
  return out;
}
