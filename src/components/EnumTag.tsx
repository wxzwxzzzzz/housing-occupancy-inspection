/**
 * EnumTag — 统一的"类型/状态"列展示
 *
 * 解决各列表页 Tag 颜色/标签写法不一致:label 统一走 dictStore(可被后端字典覆盖),
 * color 统一走 StatusColors。一处改色全局生效。
 *
 * 用法:
 *   <EnumTag dict="ApplicationStatus" value={r.status} />
 *   <EnumTag dict="AlertLevel" value={r.level} />
 */

import { Tag } from 'antd';
import React from 'react';
import { dictLabel } from '@/stores/dictStore';
import { StatusColors } from '@/utils/enum-options';

export interface EnumTagProps {
  /** 枚举名(StatusColors / EnumLabels 的 key,如 ApplicationStatus / AlertLevel) */
  dict: keyof typeof StatusColors | string;
  /** 枚举值 */
  value?: string | null;
  /** 无值时的占位 */
  fallback?: string;
}

const EnumTag: React.FC<EnumTagProps> = ({ dict, value, fallback = '-' }) => {
  if (value === undefined || value === null || value === '') {
    return <>{fallback}</>;
  }
  const colorMap = (StatusColors as Record<string, Record<string, string>>)[
    dict
  ];
  const color = colorMap?.[value] ?? 'default';
  const label = dictLabel(dict, value, value);
  return <Tag color={color}>{label}</Tag>;
};

export default EnumTag;
