/**
 * ApexCharts 公共配置
 *
 * 颜色全部走 antd cssVar (var(--ant-color-primary) 等),主题色切换时图表自动响应。
 * 风格参考 Tabler 原型:smooth curve / dashArray=4 网格 / sparkline 最小化 toolbar。
 */
import type { ApexOptions } from 'apexcharts';

/** antd cssVar 主色变量(主题色切换时实时变化) */
export const CHART_COLORS = {
  primary: 'var(--ant-color-primary)',
  primaryBg: 'var(--ant-color-primary-bg)',
  primaryHover: 'var(--ant-color-primary-hover)',
  success: 'var(--ant-color-success)',
  warning: 'var(--ant-color-warning)',
  error: 'var(--ant-color-error)',
  textTertiary: 'var(--ant-color-text-tertiary)',
  borderSecondary: 'var(--ant-color-border-secondary)',
} as const;

/** sparkline 通用底配 */
const sparkBase: Partial<ApexOptions> = {
  chart: {
    fontFamily: 'inherit',
    sparkline: { enabled: true },
    animations: { enabled: false },
    toolbar: { show: false },
  },
  tooltip: { theme: 'dark' },
  grid: { strokeDashArray: 4 },
};

interface SparkOpts {
  type: 'area' | 'line' | 'column';
  height?: number;
  /** 自定义颜色,默认主色 */
  color?: string;
}

/** 通用 sparkline:area / line / column */
export function sparkOptions({
  type,
  height = 60,
  color = CHART_COLORS.primary,
}: SparkOpts): ApexOptions {
  const base: ApexOptions = {
    ...sparkBase,
    chart: {
      ...sparkBase.chart,
      height,
      type: type === 'column' ? 'bar' : type,
    },
    colors: [color],
  };
  if (type === 'area') {
    return {
      ...base,
      stroke: { width: 2, lineCap: 'round', curve: 'smooth' },
      fill: { type: 'solid', opacity: 0.16 },
    };
  }
  if (type === 'line') {
    return {
      ...base,
      stroke: { width: 2, lineCap: 'round', curve: 'smooth' },
    };
  }
  return {
    ...base,
    plotOptions: { bar: { columnWidth: '50%' } },
    dataLabels: { enabled: false },
  };
}

/** 半圆仪表盘(radialBar) */
export function radialGaugeOptions(
  displayValue: React.ReactNode,
  height = 130,
): ApexOptions {
  return {
    chart: {
      type: 'radialBar',
      fontFamily: 'inherit',
      height,
      sparkline: { enabled: true },
      animations: { enabled: false },
    },
    plotOptions: {
      radialBar: {
        startAngle: -120,
        endAngle: 120,
        hollow: { margin: 16, size: '50%' },
        track: {
          background: CHART_COLORS.borderSecondary,
          strokeWidth: '100%',
        },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: -4,
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--ant-color-text)',
            formatter: () => String(displayValue),
          },
        },
      },
    },
    colors: [CHART_COLORS.primary],
    stroke: { lineCap: 'round' },
  };
}

/** 区域趋势图(带网格、tooltip、x 轴标签) */
export function areaTrendOptions(
  categories: string[],
  height = 280,
): ApexOptions {
  return {
    chart: {
      type: 'area',
      fontFamily: 'inherit',
      height,
      toolbar: { show: false },
      animations: { enabled: true, speed: 240 },
      parentHeightOffset: 0,
    },
    stroke: { width: 2, curve: 'smooth', lineCap: 'round' },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.32,
        opacityTo: 0.04,
        stops: [0, 100],
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: CHART_COLORS.textTertiary, fontSize: '12px' },
      },
    },
    yaxis: {
      labels: {
        style: { colors: CHART_COLORS.textTertiary, fontSize: '12px' },
      },
    },
    grid: {
      strokeDashArray: 4,
      borderColor: CHART_COLORS.borderSecondary,
      padding: { left: 0, right: 0 },
    },
    tooltip: { theme: 'dark' },
    legend: { show: false },
    colors: [CHART_COLORS.primary],
  };
}

/** 堆叠柱图(三色分类) */
export function stackedBarOptions(
  categories: string[],
  colors: string[] = [
    CHART_COLORS.primary,
    CHART_COLORS.warning,
    CHART_COLORS.error,
  ],
  height = 280,
): ApexOptions {
  return {
    chart: {
      type: 'bar',
      stacked: true,
      fontFamily: 'inherit',
      height,
      toolbar: { show: false },
      animations: { enabled: true, speed: 240 },
      parentHeightOffset: 0,
    },
    plotOptions: { bar: { columnWidth: '50%', borderRadius: 4 } },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: CHART_COLORS.textTertiary, fontSize: '12px' },
      },
    },
    yaxis: {
      labels: {
        style: { colors: CHART_COLORS.textTertiary, fontSize: '12px' },
      },
    },
    grid: {
      strokeDashArray: 4,
      borderColor: CHART_COLORS.borderSecondary,
      padding: { left: 0, right: 0 },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      labels: { colors: CHART_COLORS.textTertiary },
      markers: { size: 6 },
    },
    tooltip: { theme: 'dark' },
    colors,
  };
}
