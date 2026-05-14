/**
 * 基础档案 — 行政区划等
 */

import { buildEntityApi } from '../ontology/crud';
import { OT } from '../ontology/object-types';
import type { AdministrativeRegion } from '@/types/ontology/ap/basedoc/administrative_region';

export const administrativeRegionService = buildEntityApi<AdministrativeRegion>(
  OT.AdministrativeRegion,
  { withoutLogicDelete: true },
);
