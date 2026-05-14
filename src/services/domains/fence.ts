/**
 * 电子围栏服务 — Fence + FenceVertex
 *
 * 本体定义:
 *  - Fence:fenceType(CIRCLE/POLYGON)、center、radius
 *  - FenceVertex:fence、ordinal、point(GeoPoint)
 *
 * CIRCLE 围栏:Fence 自带 center + radius
 * POLYGON 围栏:Fence 关联多个 FenceVertex,按 ordinal 串成多边形
 */

import { buildEntityApi } from '../ontology/crud';
import { invokeAction } from '../ontology/client';
import { qb } from '../ontology/query';
import { OT } from '../ontology/object-types';
import type { Fence } from '@/types/ontology/ap/oms/fence';
import type { FenceVertex } from '@/types/ontology/ap/oms/fence_vertex';
import type { GeoPoint } from '@/types/ontology/ap/oms/geo_point';

const fenceApi = buildEntityApi<Fence>(OT.Fence);
const vertexApi = buildEntityApi<FenceVertex>(OT.FenceVertex, { withoutLogicDelete: true });

export interface CreateCircleFenceInput {
  name?: string;
  center: GeoPoint;
  radius: number;
}

export interface CreatePolygonFenceInput {
  name?: string;
  vertices: GeoPoint[];
}

export const fenceService = {
  ...fenceApi,
  vertex: vertexApi,

  async createCircle(input: CreateCircleFenceInput) {
    const env = await fenceApi.add({
      fenceType: 'CIRCLE',
      center: input.center,
      radius: input.radius,
      name: input.name,
    } as any);
    return env;
  },

  async createPolygon(input: CreatePolygonFenceInput) {
    const env = await fenceApi.add({
      fenceType: 'POLYGON',
      name: input.name,
    } as any);
    const fence = env.data as Fence | null;
    if (!fence) return env;
    // 顺序写顶点
    await Promise.all(
      input.vertices.map((p, i) =>
        vertexApi.add({
          fence: (fence as any).id,
          ordinal: i,
          point: p,
        } as any),
      ),
    );
    return env;
  },

  /** 拉取一个围栏完整数据(POLYGON 时附带顶点) */
  async detailWithVertices(id: string) {
    const fence = (await fenceApi.detail(id)).data as Fence | null;
    if (!fence) return { fence: null, vertices: [] as FenceVertex[] };
    if ((fence as any).fenceType !== 'POLYGON') return { fence, vertices: [] as FenceVertex[] };
    const env = await invokeAction<FenceVertex>({
      objectType: OT.FenceVertex,
      actionName: 'list',
      payload: qb(OT.FenceVertex)
        .eq('fence', (fence as any).id)
        .orderBy('ordinal', 'ASC')
        .page(1, 200)
        .build() as any,
    });
    return { fence, vertices: env.data };
  },

  /** 删除围栏(连带删除其顶点) */
  async deleteWithVertices(id: string) {
    const env = await invokeAction<FenceVertex>({
      objectType: OT.FenceVertex,
      actionName: 'list',
      payload: qb(OT.FenceVertex).eq('fence', id).page(1, 500).build() as any,
    });
    await Promise.all(env.data.map((v) => vertexApi.delete((v as any).id)));
    return fenceApi.delete(id);
  },
};
