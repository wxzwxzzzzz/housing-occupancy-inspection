import React, { useMemo } from 'react';
import { Input, Select, DatePicker } from 'antd';
import {
  SearchOutlined,
  CloseCircleFilled,
  MenuOutlined,
  CloseOutlined,
  DownOutlined,
} from '@ant-design/icons';
import type { FilterConfig } from '../types';

const { RangePicker } = DatePicker;

export interface QueryPanelProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onSearch?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** 当前查询方案名 */
  schemeName?: string;
  /** 切换方案的 menu(原型 demo,这里仅 UI 占位) */
  onSchemeClick?: () => void;
}

const QueryPanel: React.FC<QueryPanelProps> = ({
  filters,
  values,
  onChange,
  onSearch,
  collapsed = false,
  onCollapsedChange,
  schemeName = '默认方案',
  onSchemeClick,
}) => {
  // 已选条件 chips —— values 里非空的字段
  const chips = useMemo(() => {
    return filters
      .map((f) => {
        const v = values[f.key];
        if (v === undefined || v === null || v === '') return null;
        if (Array.isArray(v) && v.length === 0) return null;

        // 显示 label
        let display: string;
        if (f.type === 'select' || f.type === 'quick') {
          const opt = f.options?.find((o) => String(o.value) === String(v));
          display = opt?.label ?? String(v);
        } else if (f.type === 'dateRange' && Array.isArray(v)) {
          display = `${v[0] ?? ''} ~ ${v[1] ?? ''}`;
        } else {
          display = String(v);
        }
        return { key: f.key, label: f.label, display };
      })
      .filter(Boolean) as Array<{ key: string; label: string; display: string }>;
  }, [filters, values]);

  const hasConditions = chips.length > 0;

  const removeChip = (key: string) => {
    const next = { ...values };
    delete next[key];
    onChange(next);
  };

  const clearAll = () => {
    onChange({});
  };

  const set = (key: string, value: any) => {
    onChange({ ...values, [key]: value });
  };

  const renderControl = (f: FilterConfig) => {
    const value = values[f.key];
    switch (f.type) {
      case 'input':
        return (
          <Input
            className="opp-qf-control"
            size="small"
            placeholder={f.placeholder ?? `输入${f.label}`}
            value={value ?? ''}
            allowClear
            onChange={(e) => set(f.key, e.target.value)}
            onPressEnter={onSearch}
          />
        );
      case 'select':
        return (
          <Select
            className="opp-qf-control"
            size="small"
            placeholder={f.placeholder ?? '请选择'}
            allowClear
            value={value ?? undefined}
            onChange={(v) => set(f.key, v)}
            options={f.options as any}
          />
        );
      case 'quick':
        return (
          <div className="opp-qf-quick">
            {f.options.map((o) => {
              const active = String(value ?? '') === String(o.value ?? '');
              return (
                <button
                  key={String(o.value)}
                  type="button"
                  className={active ? 'active' : ''}
                  onClick={() => set(f.key, o.value)}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        );
      case 'date':
        return (
          <DatePicker
            className="opp-qf-control"
            size="small"
            value={value ?? null}
            onChange={(d) => set(f.key, d)}
            style={{ width: '100%' }}
          />
        );
      case 'dateRange':
        return (
          <RangePicker
            className="opp-qf-control"
            size="small"
            value={value ?? null}
            onChange={(d) => set(f.key, d)}
            style={{ width: '100%' }}
          />
        );
      case 'custom':
        return <div className="opp-qf-control">{f.render(value, (v) => set(f.key, v))}</div>;
      default:
        return null;
    }
  };

  return (
    <div className={`opp-query-panel${collapsed ? ' collapsed' : ''}`}>
      {/* 第一行 omnibar */}
      <div className="opp-query-omnibar-row">
        <div className="opp-query-omnibar">
          <button
            type="button"
            className="opp-omnibar-scheme"
            title="切换查询方案"
            onClick={onSchemeClick}
          >
            <span className="scheme-name">{schemeName}</span>
            <DownOutlined />
          </button>
          <div className="opp-omnibar-chips">
            {chips.length === 0 ? (
              <span className="chip-empty">未设置过滤条件</span>
            ) : (
              chips.map((c) => (
                <span key={c.key} className="opp-query-chip">
                  {c.label}: {c.display}
                  <span className="chip-close" onClick={() => removeChip(c.key)}>
                    <CloseOutlined />
                  </span>
                </span>
              ))
            )}
          </div>
          <button
            type="button"
            className={`opp-omnibar-clear${hasConditions ? ' has-conditions' : ''}`}
            title="清除全部条件"
            onClick={clearAll}
          >
            <CloseCircleFilled />
          </button>
        </div>
        <div className="opp-omnibar-actions">
          <button type="button" className="opp-oa-btn" title="执行查询" onClick={onSearch}>
            <SearchOutlined />
          </button>
          <button
            type="button"
            className="opp-oa-btn"
            title={collapsed ? '展开过滤项' : '折叠过滤项'}
            onClick={() => onCollapsedChange?.(!collapsed)}
          >
            <MenuOutlined />
          </button>
        </div>
      </div>

      {/* 第二行 filters */}
      <div className="opp-query-filters">
        {filters.map((f) => (
          <div key={f.key} className="opp-qf">
            <span className="opp-qf-label">{f.label}</span>
            {renderControl(f)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueryPanel;
