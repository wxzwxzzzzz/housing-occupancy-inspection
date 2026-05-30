/**
 * 时间格式化工具
 *
 * 统一全项目时间展示,避免直接渲染 ISO 原始串(如 2026-05-30T03:37:34.012Z)。
 * 基于 dayjs(项目已用 moment2dayjs)。
 */

import dayjs from 'dayjs';

/** 日期时间 → YYYY-MM-DD HH:mm:ss;空值返回占位 */
export function formatDateTime(
  value?: string | number | Date | null,
  fallback = '-',
): string {
  if (value === undefined || value === null || value === '') return fallback;
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : String(value);
}

/** 日期 → YYYY-MM-DD;空值返回占位 */
export function formatDate(
  value?: string | number | Date | null,
  fallback = '-',
): string {
  if (value === undefined || value === null || value === '') return fallback;
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD') : String(value);
}

/** 日期时间(分钟精度) → YYYY-MM-DD HH:mm */
export function formatDateMinute(
  value?: string | number | Date | null,
  fallback = '-',
): string {
  if (value === undefined || value === null || value === '') return fallback;
  const d = dayjs(value);
  return d.isValid() ? d.format('YYYY-MM-DD HH:mm') : String(value);
}

/**
 * 字段名是否为"时间/日期"类(用于列表/详情自动套用格式化)。
 * 命中常见命名:*At / *Time / *Date / checkIn / deadline 等。
 */
export function isDateField(field: string): boolean {
  return (
    /(^|[a-z])(at|time|date)$/i.test(field) ||
    /^(checkIn|deadline|pubts)$/i.test(field)
  );
}
