/**
 * 备案/外出务工 — MigrantWork
 */

import { buildEntityApi } from '../ontology/crud';
import { OT } from '../ontology/object-types';
import type { MigrantWork } from '@/types/ontology/prh/entities/migrant_work';

export const migrantWorkService = buildEntityApi<MigrantWork>(OT.MigrantWork);
