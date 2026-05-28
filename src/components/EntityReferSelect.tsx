/**
 * 实体引用远程下拉
 *
 * 适用于所有"指向实体的字段"(用户/居民/家庭/行政区划/请假类型/资源日历...)。
 * 输入即搜索,默认值会主动 detail 一次拿到 label,不再"显示成 id"。
 *
 * 用法:
 *   <EntityReferSelect
 *     objectType={OT.LeaveType}
 *     value={form.leaveType}
 *     onChange={(id, row) => form.setFieldValue('leaveType', id)}
 *     labelField="name"
 *     searchField="name"        // 缺省 = labelField
 *     extraFilter={(qb) => qb.eq('enable', 'true')} // 可选
 *   />
 */

import { useDebounceFn } from 'ahooks';
import type { SelectProps } from 'antd';
import { Select, Spin } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { invokeQuery } from '@/services/ontology/client';
import { type QueryBuilder, qb } from '@/services/ontology/query';

export interface EntityReferSelectProps
  extends Omit<SelectProps, 'options' | 'onChange' | 'value'> {
  /** 目标本体,如 OT.LeaveType / OT.AdministrativeRegion */
  objectType: string;
  value?: string | null;
  onChange?: (id: string | undefined, row?: Record<string, any>) => void;
  /** 用作显示 label 的字段名,默认 'name' */
  labelField?: string;
  /** 用作 LIKE 搜索的字段名,默认与 labelField 相同 */
  searchField?: string;
  /** 业务侧扩展过滤条件,在内置 like / dr=false 之外追加 */
  extraFilter?: (builder: QueryBuilder) => void;
  /** 一次拉多少条候选,默认 50 */
  pageSize?: number;
  /** 列表查询 action,默认 'list',某些实体走 'refer' 更轻 */
  actionName?: 'list' | 'refer';
}

interface Option {
  value: string;
  label: string;
  row?: Record<string, any>;
}

const EntityReferSelect: React.FC<EntityReferSelectProps> = ({
  objectType,
  value,
  onChange,
  labelField = 'name',
  searchField,
  extraFilter,
  pageSize = 50,
  actionName = 'list',
  placeholder = '请选择',
  ...selectProps
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchSeq = useRef(0);
  const finalSearchField = searchField ?? labelField;

  const fetchOptions = async (keyword?: string): Promise<Option[]> => {
    const builder = qb(objectType)
      .select(`id,${labelField},${finalSearchField}`)
      .page(1, pageSize)
      .orderBy(labelField, 'ASC');
    if (keyword) builder.like(finalSearchField, keyword);
    extraFilter?.(builder);
    const env = await invokeQuery<any>(
      objectType,
      builder.build() as any,
      actionName,
    );
    return (env.data ?? []).map((row) => ({
      value: row.id,
      label: row[labelField] ?? row.id,
      row,
    }));
  };

  /** 初次加载 + value 变化时,确保 options 至少含当前 value */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const seq = ++fetchSeq.current;
      try {
        const list = await fetchOptions();
        if (cancelled || seq !== fetchSeq.current) return;
        // 若 value 不在列表里,补一条 detail
        if (value && !list.find((o) => o.value === value)) {
          try {
            const detail = await invokeQuery<any>(
              objectType,
              qb(objectType)
                .select(`id,${labelField}`)
                .eq('id', value)
                .page(1, 1)
                .build() as any,
              'detail',
            );
            const row = detail.data?.[0];
            if (row) {
              list.unshift({
                value: row.id,
                label: row[labelField] ?? row.id,
                row,
              });
            }
          } catch {
            // 取不到就忽略,Select 会显示原始 id
          }
        }
        if (!cancelled && seq === fetchSeq.current) setOptions(list);
      } finally {
        if (!cancelled && seq === fetchSeq.current) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectType, value]);

  const { run: search } = useDebounceFn(
    async (keyword: string) => {
      setLoading(true);
      const seq = ++fetchSeq.current;
      try {
        const list = await fetchOptions(keyword);
        if (seq === fetchSeq.current) setOptions(list);
      } finally {
        if (seq === fetchSeq.current) setLoading(false);
      }
    },
    { wait: 300 },
  );

  const value_ = useMemo(() => (value === null ? undefined : value), [value]);

  return (
    <Select<string>
      showSearch
      filterOption={false}
      placeholder={placeholder}
      loading={loading}
      notFoundContent={loading ? <Spin size="small" /> : null}
      onSearch={search}
      value={value_}
      onChange={(v) => {
        const opt = options.find((o) => o.value === v);
        onChange?.(v ?? undefined, opt?.row);
      }}
      allowClear
      options={options.map(({ value: v, label }) => ({ value: v, label }))}
      {...selectProps}
    />
  );
};

export default EntityReferSelect;
