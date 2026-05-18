import React, { useState } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { DatePicker, Input, InputNumber, Select, Switch } from 'antd';
import dayjs from 'dayjs';
import type { DetailField, DetailSection } from '../types';

export interface DetailSectionsProps {
  sections: DetailSection[];
  /** 完全自定义内容(替代 sections 配置) */
  children?: React.ReactNode;
  /** 编辑态(从 OmnibarDetailPage 传入) */
  editing?: boolean;
  formValues?: Record<string, any>;
  onFormChange?: (values: Record<string, any>) => void;
  /** 完整原始记录(取 editValue 兜底) */
  record?: Record<string, any>;
}

const DetailSections: React.FC<DetailSectionsProps> = ({
  sections,
  children,
  editing = false,
  formValues = {},
  onFormChange,
  record = {},
}) => {
  const [collapsedKeys, setCollapsedKeys] = useState<Set<string>>(() => {
    const init = new Set<string>();
    sections.forEach((s) => {
      if (s.defaultCollapsed) init.add(s.key);
    });
    return init;
  });

  const toggle = (key: string) => {
    setCollapsedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (children) {
    return <div className="opp-detail-sections">{children}</div>;
  }

  // ============ 编辑态字段渲染 ============
  const renderEditControl = (f: DetailField) => {
    if (!f.name) {
      // 没有 name 的字段在编辑态仍只读
      return <span className="opp-field-value">{f.value ?? '--'}</span>;
    }
    const val = formValues[f.name] ?? f.editValue ?? record[f.name];
    const setVal = (v: any) => {
      onFormChange?.({ ...formValues, [f.name as string]: v });
    };

    if (f.editRender) {
      return f.editRender(val, setVal);
    }

    switch (f.editType) {
      case 'input':
        return (
          <Input
            size="small"
            value={val ?? ''}
            placeholder={f.placeholder}
            onChange={(e) => setVal(e.target.value)}
          />
        );
      case 'textarea':
        return (
          <Input.TextArea
            size="small"
            rows={2}
            value={val ?? ''}
            placeholder={f.placeholder}
            onChange={(e) => setVal(e.target.value)}
          />
        );
      case 'select':
        return (
          <Select
            size="small"
            style={{ width: '100%' }}
            placeholder={f.placeholder}
            value={val ?? undefined}
            onChange={setVal}
            options={f.options}
            allowClear
          />
        );
      case 'date':
        return (
          <DatePicker
            size="small"
            style={{ width: '100%' }}
            value={val ? dayjs(val) : null}
            onChange={(d) => setVal(d ? d.format('YYYY-MM-DD') : null)}
          />
        );
      case 'number':
        return (
          <InputNumber
            size="small"
            style={{ width: '100%' }}
            value={val ?? null}
            placeholder={f.placeholder}
            onChange={(v) => setVal(v)}
          />
        );
      case 'switch':
        return <Switch size="small" checked={!!val} onChange={setVal} />;
      default:
        // editType 没指定但 name 有 → 默认 input
        return (
          <Input
            size="small"
            value={val ?? ''}
            placeholder={f.placeholder}
            onChange={(e) => setVal(e.target.value)}
          />
        );
    }
  };

  return (
    <div className="opp-detail-sections">
      {sections.map((section) => {
        const collapsed = collapsedKeys.has(section.key);
        return (
          <div key={section.key} className="opp-detail-section">
            <div
              className={`opp-section-title${collapsed ? ' collapsed' : ''}`}
              onClick={() => toggle(section.key)}
            >
              <span>{section.title}</span>
              <CaretDownOutlined />
            </div>
            <div className="opp-section-body">
              <div className={`opp-detail-fields${editing ? ' editing' : ''}`}>
                {section.fields.map((f, i) => (
                  <div key={i} className="opp-field">
                    <span className="opp-field-label">
                      {f.label}
                      {editing && f.name && f.required && (
                        <span style={{ color: '#ff4d4f', marginLeft: 2 }}>*</span>
                      )}
                    </span>
                    {editing ? (
                      <div className="opp-field-edit-control">{renderEditControl(f)}</div>
                    ) : (
                      <span
                        className="opp-field-value"
                        title={typeof f.value === 'string' ? f.value : undefined}
                      >
                        {f.value ?? '--'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DetailSections;
