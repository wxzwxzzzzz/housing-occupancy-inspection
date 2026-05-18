import React, { useState } from 'react';
import { Tabs } from 'antd';
import type { DetailTabItem, ToolbarAction } from '../types';
import ToolbarActions from './ToolbarActions';

export interface DetailTabsProps {
  tabs: DetailTabItem[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  /** Tab 右侧的操作组,如「新增 / 删除 / 全屏 / 列设置」 */
  actions?: ToolbarAction[];
}

const DetailTabs: React.FC<DetailTabsProps> = ({
  tabs,
  defaultActiveKey,
  activeKey: controlledKey,
  onChange,
  actions,
}) => {
  const [innerKey, setInnerKey] = useState<string>(defaultActiveKey ?? tabs[0]?.key ?? '');
  const activeKey = controlledKey ?? innerKey;

  const handleChange = (k: string) => {
    if (controlledKey === undefined) setInnerKey(k);
    onChange?.(k);
  };

  return (
    <div className="opp-detail-tabs">
      <Tabs
        activeKey={activeKey}
        onChange={handleChange}
        items={tabs.map((t) => ({
          key: t.key,
          label: t.label,
          children: t.content,
          destroyInactiveTabPane: t.destroyInactive ?? true,
        }))}
        tabBarExtraContent={
          actions ? (
            <div className="opp-detail-tab-actions">
              <ToolbarActions actions={actions} />
            </div>
          ) : null
        }
      />
    </div>
  );
};

export default DetailTabs;
