/**
 * 角色 / 菜单服务 — Role / Menu
 *
 * B 轨新增：角色/权限/菜单本体暂无实体，先走临时类型 + mock。
 * 标准 CRUD 已满足 System/Role、System/Menu 页面。待后端补实体后换 URL 即用。
 */

import { buildEntityApi } from '../ontology/crud';
import { OT } from '../ontology/object-types';
import type { Role } from '@/types/ontology/prh/entities/role';
import type { Menu } from '@/types/ontology/prh/entities/menu';

export const roleService = buildEntityApi<Role>(OT.Role);
export const menuService = buildEntityApi<Menu>(OT.Menu);
