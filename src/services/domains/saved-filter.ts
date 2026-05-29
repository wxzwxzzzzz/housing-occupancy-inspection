/**
 * 保存的筛选器服务 — SavedFilter
 *
 * B 轨新增：筛选器本体暂无实体，先走临时类型 + mock。标准 CRUD 即满足 Filter 页面。
 * 待后端补实体后换 URL 即用。
 */

import { buildEntityApi } from '../ontology/crud';
import { OT } from '../ontology/object-types';
import type { SavedFilter } from '@/types/ontology/prh/entities/saved_filter';

export const savedFilterService = buildEntityApi<SavedFilter>(OT.SavedFilter);
