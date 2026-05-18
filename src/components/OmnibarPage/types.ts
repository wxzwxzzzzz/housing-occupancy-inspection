import type { MenuProps } from 'antd';
import type React from 'react';

/** 工具栏 / 详情头部 / Tab actions 用的统一按钮配置 */
export type ToolbarAction =
  | {
      key: string;
      type?: 'primary' | 'default' | 'icon';
      label?: React.ReactNode;
      icon?: React.ReactNode;
      /** 显示 caret(下拉箭头),配合 dropdownItems */
      dropdown?: boolean;
      dropdownItems?: MenuProps['items'];
      disabled?: boolean;
      danger?: boolean;
      onClick?: () => void;
      /** tooltip / title */
      title?: string;
      divider?: false;
    }
  | { divider: true; key?: string };

/** 查询面板的过滤项配置 */
export type FilterConfig =
  | {
      key: string;
      label: string;
      type: 'input';
      placeholder?: string;
    }
  | {
      key: string;
      label: string;
      type: 'select';
      options: { value: string | number | boolean | null; label: string }[];
      placeholder?: string;
    }
  | {
      key: string;
      label: string;
      type: 'quick';
      options: { value: string | number | boolean | null; label: string }[];
    }
  | {
      key: string;
      label: string;
      type: 'date';
      placeholder?: string;
    }
  | {
      key: string;
      label: string;
      type: 'dateRange';
      placeholder?: [string, string];
    }
  | {
      key: string;
      label: string;
      type: 'custom';
      render: (val: any, onChange: (v: any) => void) => React.ReactNode;
    };

/** 详情字段(单行) */
export interface DetailField {
  /** 字段标签 */
  label: string;
  /** 只读态展示值(可以是 Tag/格式化文字/任意 ReactNode) */
  value: React.ReactNode;

  // ============ 编辑态(可选) ============
  /**
   * 数据字段名,如 'fullName' / 'phone'。
   * 不填表示该字段不可编辑(进入编辑态时仍只读)
   */
  name?: string;
  /** 编辑态控件类型 */
  editType?: 'input' | 'textarea' | 'select' | 'date' | 'number' | 'switch';
  /** select 用 options */
  options?: { label: string; value: any }[];
  /**
   * 编辑态原始值(若不填,组件会从 record[name] 取)。
   * 用于 value 显示态做了 mask/格式化的字段,需要 editValue 提供原值。
   */
  editValue?: any;
  /** 是否必填 */
  required?: boolean;
  /** 自定义编辑控件(覆盖 editType) */
  editRender?: (val: any, onChange: (v: any) => void) => React.ReactNode;
  /** 占位符 */
  placeholder?: string;
}

/** 详情字段段(多行字段网格 + 可折叠) */
export interface DetailSection {
  key: string;
  title: string;
  fields: DetailField[];
  defaultCollapsed?: boolean;
}

/** 详情 Tab 配置 */
export interface DetailTabItem {
  key: string;
  label: React.ReactNode;
  content: React.ReactNode;
  /** 只在 active 时渲染,默认 true(更省性能) */
  destroyInactive?: boolean;
}

/** 状态徽章 */
export interface StatusBadge {
  text: React.ReactNode;
  color?: 'success' | 'warning' | 'danger' | 'secondary' | 'primary' | 'info';
}
