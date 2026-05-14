/**
 * 居民服务 — Resident
 *
 * 自定义动作:verify(身份/资质验证)、archive(归档)
 */

import { buildEntityApi } from '../ontology/crud';
import { invokeAction } from '../ontology/client';
import { OT } from '../ontology/object-types';
import type { Resident } from '@/types/ontology/prh/entities/resident';
import type { TerminationReason } from '@/types/ontology/prh/enums';

const base = buildEntityApi<Resident>(OT.Resident);

export const residentService = {
  ...base,

  verify(id: string, facePhoto?: string) {
    return invokeAction<Resident>({
      objectType: OT.Resident,
      actionName: 'verify',
      payload: { id, facePhoto },
    });
  },

  archive(id: string, archiveReason: TerminationReason, archiveNote?: string) {
    return invokeAction<Resident>({
      objectType: OT.Resident,
      actionName: 'archive',
      payload: { id, archiveReason, archiveNote },
    });
  },
};
