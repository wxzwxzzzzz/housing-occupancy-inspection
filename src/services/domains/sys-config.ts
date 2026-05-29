/**
 * 系统配置服务 — SysConfig (KV)
 *
 * B 轨新增（见 本体改动集-交接本体团队.md 改动 5）。
 * 标准 CRUD + 便捷的 loadMap(读全部为 {key:value}) / saveMap(批量 upsert)。
 * 待后端补 SysConfig 实体后换 URL 即用。
 */

import { buildEntityApi } from '../ontology/crud';
import { OT } from '../ontology/object-types';
import type { SysConfig } from '@/types/ontology/prh/entities/sys_config';
import type { ConfigValueType } from '@/types/ontology/prh/enums';

const base = buildEntityApi<SysConfig>(OT.SysConfig);

function inferType(v: unknown): ConfigValueType {
  if (typeof v === 'boolean') return 'BOOLEAN';
  if (typeof v === 'number') return 'NUMBER';
  if (v && typeof v === 'object') return 'JSON';
  return 'STRING';
}

function serialize(v: unknown): string {
  if (v === undefined || v === null) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export const sysConfigService = {
  ...base,

  /** 读取全部配置为 { configKey: configValue(原始字符串) } 映射 */
  async loadMap(): Promise<Record<string, string>> {
    const env = await base.list({ page: { pageNo: 1, pageSize: 1000 } });
    const map: Record<string, string> = {};
    for (const row of env.data as SysConfig[]) {
      if (row.configKey) map[row.configKey] = row.configValue ?? '';
    }
    return map;
  },

  /**
   * 批量保存配置(upsert by configKey)。
   * 已存在则 modify，不存在则 add；值统一序列化为字符串。
   */
  async saveMap(values: Record<string, unknown>, category?: string): Promise<void> {
    const env = await base.list({ page: { pageNo: 1, pageSize: 1000 } });
    const existing = new Map<string, SysConfig>();
    for (const row of env.data as SysConfig[]) {
      if (row.configKey) existing.set(row.configKey, row);
    }
    await Promise.all(
      Object.entries(values).map(([key, val]) => {
        const payload = {
          configKey: key,
          configValue: serialize(val),
          valueType: inferType(val),
          category,
        };
        const hit = existing.get(key);
        return hit
          ? base.modify({ id: hit.id, ...payload } as Partial<SysConfig> & { id: string })
          : base.add(payload as Partial<SysConfig>);
      }),
    );
  },
};
