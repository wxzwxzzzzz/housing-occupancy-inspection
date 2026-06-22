import React from 'react';
import { Button, Dropdown } from 'antd';
import type { ToolbarAction } from '../types';

interface ToolbarActionsProps {
  actions?: ToolbarAction[];
  size?: 'small' | 'middle';
}

/**
 * 渲染一组按钮 / dropdown / divider,工具栏 / 详情头部 / Tab actions 都用。
 * 按设计要求:不渲染任何图标,统一为文字按钮;「新建」等 primary 保留蓝底,其余白底描边。
 * 纯图标动作(type==='icon')降级为显示其 title 文字的白底按钮。
 */
export const ToolbarActions: React.FC<ToolbarActionsProps> = ({ actions, size = 'small' }) => {
  if (!actions || actions.length === 0) return null;

  return (
    <>
      {actions.map((a, i) => {
        if (a.divider) {
          return <span key={a.key ?? `divider-${i}`} className="opp-vr" aria-hidden />;
        }

        // icon-only 动作:去掉图标后用 title 文字兜底,作为普通白底按钮
        if (a.type === 'icon') {
          const text = a.label ?? a.title;
          if (!text) return null;
          return (
            <Button
              key={a.key}
              type="default"
              size={size}
              disabled={a.disabled}
              danger={a.danger}
              onClick={a.onClick}
            >
              {text}
            </Button>
          );
        }

        // dropdown
        if (a.dropdown && a.dropdownItems) {
          return (
            <Dropdown
              key={a.key}
              menu={{ items: a.dropdownItems }}
              trigger={['click']}
              disabled={a.disabled}
            >
              <Button type={a.type === 'primary' ? 'primary' : 'default'} size={size} danger={a.danger}>
                {a.label}
                <span className="opp-caret" aria-hidden />
              </Button>
            </Dropdown>
          );
        }

        // 普通按钮
        return (
          <Button
            key={a.key}
            type={a.type === 'primary' ? 'primary' : 'default'}
            size={size}
            disabled={a.disabled}
            danger={a.danger}
            onClick={a.onClick}
          >
            {a.label}
          </Button>
        );
      })}
    </>
  );
};

export default ToolbarActions;
