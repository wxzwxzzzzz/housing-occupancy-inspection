/**
 * 主题设置面板(右侧抽屉内容)
 *
 * 参考原型 #offcanvas-settings 结构:
 *  - 颜色模式(浅色 / 深色)
 *  - 主题色(12 个预设色块)
 *  - 底部"重置为默认"
 *
 * 都通过 appStore 持久化,BasicLayout 顶层 ConfigProvider 监听并应用。
 */

import { CheckOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { appStore, type ThemeMode } from '@/stores';

export const PRESET_COLORS = [
  '#1d4ed8', // 拂晓蓝(默认)
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

const DEFAULT_PRIMARY = '#1d4ed8';
const DEFAULT_MODE: ThemeMode = 'light';

const useStyles = createStyles(({ token, css }) => ({
  wrap: css`
    height: 100%;
    display: flex;
    flex-direction: column;
  `,
  body: css`
    flex: 1;
    overflow-y: auto;
  `,
  section: css`
    margin-bottom: 28px;
  `,
  label: css`
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: ${token.colorText};
    margin-bottom: 4px;
  `,
  hint: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
    margin: 0 0 12px;
  `,
  modeGroup: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,
  modeItem: css`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
    cursor: pointer;
    background: ${token.colorBgContainer};
    color: ${token.colorText};
    transition: border-color 0.15s ease, background 0.15s ease;
    text-align: left;
    width: 100%;
    &:hover {
      border-color: ${token.colorPrimary};
    }
  `,
  modeItemActive: css`
    border-color: ${token.colorPrimary};
    background: ${token.colorPrimaryBg};
    color: ${token.colorPrimary};
  `,
  modeIcon: css`
    font-size: 16px;
  `,
  grid: css`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
  `,
  swatch: css`
    width: 28px;
    height: 28px;
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
      border-radius: 9px;
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
  footer: css`
    padding-top: 16px;
    border-top: 1px solid ${token.colorBorderSecondary};
    margin-top: 16px;
  `,
}));

const MODE_OPTIONS: Array<{
  value: ThemeMode;
  label: string;
  icon: React.ReactNode;
}> = [
  { value: 'light', label: '浅色', icon: <SunOutlined /> },
  { value: 'dark', label: '深色', icon: <MoonOutlined /> },
];

const ThemeSettings: React.FC = observer(() => {
  const { styles, cx } = useStyles();
  const current = appStore.primaryColor;
  const mode = appStore.themeMode;

  const handleReset = () => {
    appStore.setThemeMode(DEFAULT_MODE);
    appStore.setPrimaryColor(DEFAULT_PRIMARY);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.body}>
        <div className={styles.section}>
          <div className={styles.label}>颜色模式</div>
          <p className={styles.hint}>选择应用的颜色模式。</p>
          <div className={styles.modeGroup}>
            {MODE_OPTIONS.map((opt) => {
              const active = mode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={cx(
                    styles.modeItem,
                    active && styles.modeItemActive,
                  )}
                  onClick={() => appStore.setThemeMode(opt.value)}
                >
                  <span className={styles.modeIcon}>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>主题色</div>
          <p className={styles.hint}>选择应用的主色调。</p>
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

      <div className={styles.footer}>
        <Button block onClick={handleReset}>
          重置为默认
        </Button>
      </div>
    </div>
  );
});

export default ThemeSettings;
