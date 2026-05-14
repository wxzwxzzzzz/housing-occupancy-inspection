/**
 * QueryBuilder — 链式构造 QuerySpec
 *
 * 用法:
 *   qb(OT.Resident)
 *     .select('id,fullName,idCardNo,status')
 *     .where('status', 'EQ', 'ACTIVATED')
 *     .like('fullName', '张')
 *     .orderBy('createAt', 'DESC')
 *     .page(1, 20)
 *     .build();
 *
 * 设计要点:
 *  - 默认顶层 group 为 AND;调用 .or() 可切换为 OR;
 *  - 多次 .where 追加到当前 group;
 *  - .group(qb => qb.or().where(...)) 嵌套子条件组;
 *  - 不持有外部状态,每个 builder 独立可复用。
 */

import type {
  QueryComparisonOperator,
} from '@/types/ontology/ap/oql/query_comparison_operator';
import type { QueryFilterCondition } from '@/types/ontology/ap/oql/query_filter_condition';
import type { QueryFilterGroup } from '@/types/ontology/ap/oql/query_filter_group';
import type { QueryLogicalOperator } from '@/types/ontology/ap/oql/query_logical_operator';
import type { QuerySortDirection } from '@/types/ontology/ap/oql/query_sort_direction';
import type { QuerySortItem } from '@/types/ontology/ap/oql/query_sort_item';
import type { QuerySpec } from '@/types/ontology/ap/oql/query_spec';

export class QueryBuilder {
  private readonly objectType: string;
  private _selection?: string;
  private _metrics?: string;
  private _dimensions?: string;
  private _having?: QueryFilterGroup;
  private _filter: QueryFilterGroup = { operator: 'AND', conditions: [], groups: [] };
  private readonly _sortItems: QuerySortItem[] = [];
  private _pageNo = 1;
  private _pageSize = 20;
  private _pageEnabled = true;

  constructor(objectType: string) {
    this.objectType = objectType;
  }

  /** 字段投影,逗号分隔 */
  select(selection: string): this {
    this._selection = selection;
    return this;
  }

  /** 顶层逻辑改为 OR */
  or(): this {
    this._filter.operator = 'OR';
    return this;
  }

  /** 顶层逻辑改回 AND(默认就是 AND) */
  and(): this {
    this._filter.operator = 'AND';
    return this;
  }

  where(field: string, operator: QueryComparisonOperator, value?: unknown, value2?: unknown): this {
    const cond: QueryFilterCondition = { field, operator };
    if (value !== undefined) cond.value1 = String(value);
    if (value2 !== undefined) cond.value2 = String(value2);
    this._filter.conditions!.push(cond);
    return this;
  }

  eq(field: string, value: unknown): this {
    return this.where(field, 'EQ', value);
  }

  ne(field: string, value: unknown): this {
    return this.where(field, 'NE', value);
  }

  gt(field: string, value: unknown): this {
    return this.where(field, 'GT', value);
  }

  ge(field: string, value: unknown): this {
    return this.where(field, 'GE', value);
  }

  lt(field: string, value: unknown): this {
    return this.where(field, 'LT', value);
  }

  le(field: string, value: unknown): this {
    return this.where(field, 'LE', value);
  }

  like(field: string, keyword: string): this {
    return this.where(field, 'LIKE', keyword);
  }

  in(field: string, values: unknown[]): this {
    this._filter.conditions!.push({ field, operator: 'IN', values });
    return this;
  }

  between(field: string, from: unknown, to: unknown): this {
    return this.where(field, 'BETWEEN', from, to);
  }

  isNull(field: string): this {
    return this.where(field, 'IS_NULL');
  }

  notNull(field: string): this {
    return this.where(field, 'NOT_NULL');
  }

  /** 嵌套子组,例如 (a=1 AND (b=2 OR c=3)) */
  group(operator: QueryLogicalOperator, builder: (gb: GroupBuilder) => void): this {
    const sub: QueryFilterGroup = { operator, conditions: [], groups: [] };
    const gb = new GroupBuilder(sub);
    builder(gb);
    this._filter.groups!.push(sub);
    return this;
  }

  orderBy(field: string, direction: QuerySortDirection = 'ASC'): this {
    this._sortItems.push({ path: field, direction });
    return this;
  }

  page(pageNo: number, pageSize: number): this {
    this._pageNo = pageNo;
    this._pageSize = pageSize;
    this._pageEnabled = true;
    return this;
  }

  /** 不要分页(常用于报表导出) */
  noPage(): this {
    this._pageEnabled = false;
    return this;
  }

  /** 聚合指标(给 Fact 报表用),逗号分隔 */
  metrics(metrics: string): this {
    this._metrics = metrics;
    return this;
  }

  /** 分组维度,逗号分隔 */
  dimensions(dimensions: string): this {
    this._dimensions = dimensions;
    return this;
  }

  having(filter: QueryFilterGroup): this {
    this._having = filter;
    return this;
  }

  /** 默认带 dr=false(逻辑未删除),便于业务直接用 */
  excludeDeleted(): this {
    return this.eq('dr', 'false');
  }

  build(): QuerySpec {
    const spec: QuerySpec = { objectType: this.objectType };
    if (this._selection) spec.selection = this._selection;
    if (this._metrics) spec.metrics = this._metrics;
    if (this._dimensions) spec.dimensions = this._dimensions;
    if (this._having) spec.having = this._having;

    const hasCondition =
      (this._filter.conditions?.length ?? 0) > 0 || (this._filter.groups?.length ?? 0) > 0;
    if (hasCondition) {
      spec.filter = this._filter;
    }
    if (this._sortItems.length > 0) {
      spec.sortItems = this._sortItems;
    }
    if (this._pageEnabled) {
      spec.page = { pageNo: this._pageNo, pageSize: this._pageSize };
    }
    return spec;
  }
}

class GroupBuilder {
  constructor(private readonly group: QueryFilterGroup) {}

  where(field: string, operator: QueryComparisonOperator, value?: unknown, value2?: unknown): this {
    const cond: QueryFilterCondition = { field, operator };
    if (value !== undefined) cond.value1 = String(value);
    if (value2 !== undefined) cond.value2 = String(value2);
    this.group.conditions!.push(cond);
    return this;
  }

  in(field: string, values: unknown[]): this {
    this.group.conditions!.push({ field, operator: 'IN', values });
    return this;
  }
}

/** 工厂入口 */
export function qb(objectType: string): QueryBuilder {
  return new QueryBuilder(objectType);
}
