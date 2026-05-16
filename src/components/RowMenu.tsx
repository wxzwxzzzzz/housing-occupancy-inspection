/**
 * 表格行的"更多操作"按钮 + 右键菜单
 *
 * 用法 1(列里加 ⋮ 按钮):
 *   columns: [
 *     ...,
 *     RowMenu.column<Record>((record) => [
 *       { key: 'view', label: '查看居民', onClick: () => ... },
 *       ...
 *     ]),
 *   ]
 *
 * 用法 2(右键整行):
 *   <Table onRow={(record) => RowMenu.contextMenu(buildItems(record))} />
 *
 * 之所以做成一个 namespace,是因为 antd Table 列定义和 onRow 是两套 API,
 * 用相同 items builder 可以一致输出。
 */

import React from 'react';
import { Button, Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import type { ItemType } from 'antd/es/menu/interface';

export type MenuItems = (ItemType | false | null | undefined)[];

function clean(items: MenuItems): ItemType[] {
  return items.filter(Boolean) as ItemType[];
}

/** 生成一个"操作"列(⋮ 按钮) */
function column<T>(
  build: (record: T) => MenuItems,
  options?: { width?: number; fixed?: 'right' | 'left' },
): ColumnType<T> {
  return {
    title: '',
    key: '__rowMenu__',
    width: options?.width ?? 40,
    fixed: options?.fixed,
    render: (_: any, record: T) => {
      const items = clean(build(record));
      if (items.length === 0) return null;
      return (
        <Dropdown trigger={['click']} menu={{ items }} placement="bottomRight">
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      );
    },
  };
}

/**
 * onRow 工厂:让任意一行支持右键菜单。
 * antd Table 没原生右键,我们自己做一个浮层 Dropdown。
 */
function makeContextMenuOnRow<T>(
  build: (record: T) => MenuItems,
  baseOnRow?: (record: T) => Record<string, any>,
) {
  return (record: T) => {
    const base = baseOnRow?.(record) ?? {};
    return {
      ...base,
      onContextMenu: (e: React.MouseEvent) => {
        const items = clean(build(record));
        if (items.length === 0) return;
        e.preventDefault();
        // 用 antd Dropdown 不能动态唤起,这里使用一个内置的 PortalMenu
        showContextMenu(e.clientX, e.clientY, items);
      },
    };
  };
}

// ---------- Portal 浮层 ----------
let mountNode: HTMLDivElement | null = null;

function ensureMountNode(): HTMLDivElement {
  if (mountNode) return mountNode;
  mountNode = document.createElement('div');
  mountNode.style.position = 'fixed';
  mountNode.style.zIndex = '2000';
  mountNode.style.left = '0';
  mountNode.style.top = '0';
  document.body.appendChild(mountNode);
  return mountNode;
}

function showContextMenu(x: number, y: number, items: ItemType[]) {
  const node = ensureMountNode();

  // 先卸载之前的(简陋版,不引入 react-dom 的 createRoot 复杂度)
  hideContextMenu();

  const menu = document.createElement('div');
  menu.style.position = 'fixed';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.style.minWidth = '160px';
  menu.style.background = '#fff';
  menu.style.borderRadius = '6px';
  menu.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
  menu.style.padding = '4px';
  menu.style.fontSize = '14px';
  menu.style.userSelect = 'none';

  items.forEach((item: any, i) => {
    if (!item) return;
    if (item.type === 'divider') {
      const div = document.createElement('div');
      div.style.borderTop = '1px solid #f0f0f0';
      div.style.margin = '4px 0';
      menu.appendChild(div);
      return;
    }
    const it = document.createElement('div');
    it.textContent = String(item.label ?? '');
    it.style.padding = '6px 12px';
    it.style.cursor = 'pointer';
    it.style.borderRadius = '4px';
    if (item.danger) it.style.color = '#ff4d4f';
    it.addEventListener('mouseenter', () => {
      it.style.background = '#f5f5f5';
    });
    it.addEventListener('mouseleave', () => {
      it.style.background = 'transparent';
    });
    it.addEventListener('click', () => {
      try {
        item.onClick?.({ key: String(item.key ?? i) });
      } finally {
        hideContextMenu();
      }
    });
    menu.appendChild(it);
  });

  node.appendChild(menu);

  // 边界纠正
  setTimeout(() => {
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${Math.max(0, x - rect.width)}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${Math.max(0, y - rect.height)}px`;
    }
  }, 0);

  // 一次性外部点击/Esc 关闭
  const handler = (e: MouseEvent | KeyboardEvent) => {
    if (e instanceof KeyboardEvent && e.key !== 'Escape') return;
    hideContextMenu();
  };
  setTimeout(() => {
    window.addEventListener('mousedown', handler as any, { once: true });
    window.addEventListener('keydown', handler as any, { once: true });
  }, 0);
}

function hideContextMenu() {
  if (!mountNode) return;
  while (mountNode.firstChild) mountNode.removeChild(mountNode.firstChild);
}

export const RowMenu = {
  column,
  contextMenuOnRow: makeContextMenuOnRow,
};

export default RowMenu;
