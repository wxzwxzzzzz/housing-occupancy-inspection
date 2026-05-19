/**
 * Dashboard 视觉令牌(参考 Tabler 原型)
 *
 * 风格要点:
 *  - 卡片 squircle 圆角(@supports corner-shape)
 *  - color-mix 派生主色 16% 透明背景
 *  - 阴影 hover 浮起
 *  - 动画 cubic-bezier(0.16, 1, 0.3, 1) 弹性入场
 */
import { createStyles } from 'antd-style';

export const useDashboardStyles = createStyles(({ token, css }) => {
  const radius = token.borderRadiusLG;
  const radiusSquircle = radius * 2.5;
  const cardShadow = '0 1px 2px 0 rgba(18,18,23,.05)';
  const cardShadowHover =
    '0 4px 6px -2px rgba(0,0,0,.08), 0 10px 15px -3px rgba(0,0,0,.06)';
  const easeOut = 'cubic-bezier(0.16, 1, 0.3, 1)';

  return {
    page: css`
      max-width: 1320px;
      margin: 0 auto;
      padding: 16px;
      .ant-card {
        border: 1px solid ${token.colorBorderSecondary};
        border-radius: ${radius}px;
        box-shadow: ${cardShadow};
        transition: box-shadow .2s ${easeOut};
        @supports (corner-shape: squircle) {
          corner-shape: squircle;
          border-radius: ${radiusSquircle}px;
        }
      }
      .ant-card:hover {
        box-shadow: ${cardShadowHover};
      }
      .ant-card-body { padding: 16px; }
    `,

    /** 欢迎卡(白底黑字,与其他卡片一致) */
    welcomeCard: css`
      color: ${token.colorText};
      background: ${token.colorBgContainer};
      .welcome-title {
        font-size: 22px;
        font-weight: 600;
        line-height: 1.4;
        color: ${token.colorText};
      }
      .welcome-sub {
        margin-top: 6px;
        font-size: 13px;
        color: ${token.colorTextSecondary};
      }
      .welcome-stats {
        display: flex;
        gap: 32px;
        margin-top: 22px;
      }
      .welcome-stat-num {
        font-size: 26px;
        font-weight: 700;
        line-height: 1.2;
        color: ${token.colorText};
      }
      .welcome-stat-label {
        font-size: 12px;
        color: ${token.colorTextTertiary};
        margin-top: 2px;
      }
      .welcome-actions { margin-top: 22px; }
    `,

    /** KPI 卡片(标题 + 大数 + 趋势 + sparkline) */
    kpiCard: css`
      .kpi-body { padding: 4px 0 8px; }
      .kpi-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .kpi-label {
        font-size: 12px;
        color: ${token.colorTextSecondary};
        text-transform: uppercase;
        letter-spacing: .04em;
      }
      .kpi-value {
        font-size: 28px;
        font-weight: 700;
        line-height: 1.2;
        color: ${token.colorText};
        margin-top: 6px;
      }
      .kpi-subtext {
        font-size: 12px;
        color: ${token.colorTextTertiary};
        margin-top: 4px;
      }
      .kpi-sparkline { margin-top: 8px; }
    `,

    /** 趋势徽章 */
    trendUp: css`
      display: inline-flex; align-items: center; gap: 2px;
      font-size: 12px; font-weight: 600;
      color: ${token.colorSuccess};
    `,
    trendDown: css`
      display: inline-flex; align-items: center; gap: 2px;
      font-size: 12px; font-weight: 600;
      color: ${token.colorError};
    `,
    trendFlat: css`
      display: inline-flex; align-items: center; gap: 2px;
      font-size: 12px; font-weight: 600;
      color: ${token.colorTextQuaternary};
    `,

    /** stat 小卡(方头像 + 主标题 + 副文案) */
    statCard: css`
      cursor: pointer;
      transition: transform .2s ${easeOut};
      &:hover { transform: translateY(-2px); }
      .stat-row {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .stat-icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: grid;
        place-items: center;
        color: #fff;
        font-size: 20px;
        flex-shrink: 0;
        @supports (corner-shape: squircle) {
          corner-shape: squircle;
          border-radius: 14px;
        }
      }
      .stat-title {
        font-size: 15px;
        font-weight: 600;
        color: ${token.colorText};
        line-height: 1.3;
      }
      .stat-sub {
        font-size: 12px;
        color: ${token.colorTextTertiary};
        margin-top: 2px;
      }
    `,

    /** 卡片标题(顶部 14px font + 右侧时间下拉) */
    cardHeader: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      .header-title {
        font-size: 14px;
        font-weight: 600;
        color: ${token.colorText};
      }
      .header-extra {
        display: flex; align-items: center; gap: 8px;
      }
    `,

    /** 列表/表格容器(380px 内滚动) */
    scrollList: css`
      max-height: 340px;
      overflow-y: auto;
      margin: -4px 0;
    `,

    /** 列表项行风格 */
    alertItem: css`
      padding: 12px 0;
      border-bottom: 1px solid ${token.colorBorderSecondary};
      transition: background .15s ${easeOut};
      &:last-child { border-bottom: 0; }
      &:hover {
        background: color-mix(in srgb, ${token.colorPrimary} 4%, transparent);
      }
      .alert-row {
        display: flex; align-items: center; gap: 12px;
      }
      .alert-meta {
        font-size: 12px; color: ${token.colorTextTertiary};
        margin-top: 2px;
      }
    `,

    /** 完整预警表格容器 */
    alertTable: css`
      .ant-table-thead > tr > th {
        background: ${token.colorFillTertiary};
        font-weight: 600;
      }
    `,

    /** 时间下拉链接 */
    timeRange: css`
      color: ${token.colorTextTertiary};
      font-size: 12px;
      cursor: pointer;
      &:hover { color: ${token.colorPrimary}; }
    `,
  };
});
