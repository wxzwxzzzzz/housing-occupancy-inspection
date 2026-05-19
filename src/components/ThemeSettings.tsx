/**
 * 主题设置面板
 *
 * - 外观模式:亮色 / 暗色(antd 5 darkAlgorithm)
 * - 主题色:12 个预设
 *
 * 都通过 appStore 持久化,BasicLayout 顶层 ConfigProvider 监听并应用。
 */

import { CheckOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Segmented } from 'antd';
import { createStyles } from 'antd-style';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { appStore, type ThemeMode } from '@/stores';

export const PRESET_COLORS = [
  '#1677ff', // 拂晓蓝(默认)
  '#722ed1', // 酱紫
  '#13c2c2', // 明青
  '#52c41a', // 极光绿
  '#fa8c16', // 日暮
  '#fa541c', // 火山
  '#f5222d', // 薄暮
  '#eb2f96', // 桃红
  '#2f54eb', // 极客蓝
  '#a0d911', // 黄绿
  '#faad14', // 金盏花
  '#161616', // 中性黑
];

const useStyles = createStyles(({ token, css }) => ({
  wrap: css`
    padding: 14px;
    min-width: 240px;
  `,
  section: css`
    & + & { margin-top: 14px; }
  `,
  title: css`
    font-size: 12px;
    color: ${token.colorTextSecondary};
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  `,
  segmented: css`
    width: 100%;
    .ant-segmented-item-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  `,
  grid: css`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
  `,
  swatch: css`
    width: 24px;
    height: 24px;
    padding: 0;
    border: 0;
    border-radius: 6px;
    cursor: pointer;
    display: grid;
    place-items: center;
    color: #fff;
    transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
    @supports (corner-shape: squircle) {
      corner-shape: squircle;
      border-radius: 8px;
    }
    &:hover {
      transform: scale(1.1);
    }
  `,
  swatchActive: css`
    box-shadow:
      inset 0 0 0 1px rgba(0, 0, 0, 0.1),
      0 0 0 2px ${token.colorBgContainer},
      0 0 0 4px currentColor;
  `,
}));

const ThemeSettings: React.FC = observer(() => {
  const { styles, cx } = useStyles();
  const current = appStore.primaryColor;

  return (
    <div className={styles.wrap}>
      <div className={styles.section}>
        <div className={styles.title}>外观</div>
        <Segmented
          className={styles.segmented}
          value={appStore.themeMode}
          onChange={(v) => appStore.setThemeMode(v as ThemeMode)}
          options={[
            { label: '亮色', value: 'light', icon: <SunOutlined /> },
            { label: '暗色', value: 'dark', icon: <MoonOutlined /> },
          ]}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.title}>主题色</div>
        <div className={styles.grid}>
          {PRESET_COLORS.map((color) => {
            const active = color.toLowerCase() === current.toLowerCase();
            return (
              <button
                key={color}
                type="button"
                aria-label={`切换到 ${color}`}
                title={color}
                className={cx(styles.swatch, active && styles.swatchActive)}
                style={{ background: color, color }}
                onClick={() => appStore.setPrimaryColor(color)}
              >
                {active && (
                  <CheckOutlined style={{ fontSize: 12, color: '#fff' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default ThemeSettings;
