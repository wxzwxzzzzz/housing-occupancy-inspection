import React from 'react';
import { Button, Dropdown, Tooltip } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { ToolbarAction } from '../types';

interface ToolbarActionsProps {
  actions?: ToolbarAction[];
  size?: 'small' | 'middle';
}

/**
 * 渲染一组按钮 / dropdown / divider,工具栏 / 详情头部 / Tab actions 都用
 */
export const ToolbarActions: React.FC<ToolbarActionsProps> = ({ actions, size = 'small' }) => {
  if (!actions || actions.length === 0) return null;

  return (
    <>
      {actions.map((a, i) => {
        if (a.divider) {
          return <span key={a.key ?? `divider-${i}`} className="opp-vr" aria-hidden />;
        }

        // icon-only
        if (a.type === 'icon') {
          const btn = (
            <Button
              type="text"
              size={size}
              icon={a.icon}
              disabled={a.disabled}
              danger={a.danger}
              onClick={a.onClick}
            />
          );
          return (
            <span key={a.key}>
              {a.title ? <Tooltip title={a.title}>{btn}</Tooltip> : btn}
            </span>
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
              <Button type={a.type === 'primary' ? 'primary' : 'default'} size={size} icon={a.icon} danger={a.danger}>
                {a.label} <DownOutlined style={{ fontSize: 10 }} />
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
            icon={a.icon}
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
