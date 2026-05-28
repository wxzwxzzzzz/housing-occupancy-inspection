/**
 * 字典中心 — Dict Store
 *
 * 设计原则:
 *  1. 默认值由 `EnumLabels`(static) 提供,保证离线/首屏也能用
 *  2. 启动时尝试调用一次 `dictRefresh()`,从后端拉运行时字典覆盖
 *  3. 后端没有字典服务时,refresh 静默失败,前端继续用默认值
 *
 * 后端契约(可选):
 *   POST /api/v1/ontology/list
 *   {
 *     "objectType": "cn.byteawake.ap.oms.EnumDefinition",
 *     "payload": { "page": { "pageNo": 1, "pageSize": 1000 } }
 *   }
 *   data: [{ enumName, members: [{ name, label, code }] }]
 *
 * 用法:
 *   import { dictStore, useEnumOptions } from '@/stores/dictStore';
 *   const options = useEnumOptions('Gender');                // 自动响应字典更新
 *   const label = dictStore.label('Gender', 'MALE');         // 任何位置都能拿
 */

import { request } from '@umijs/max';
import { makeAutoObservable, runInAction } from 'mobx';
import { useEffect, useState } from 'react';
import { EnumLabels } from '@/utils/enum-options';

interface DictMember {
  /** 枚举值,如 'MALE' */
  name: string;
  /** 中文标签,如 '男' */
  label: string;
  /** 后端 code,通常是数字字符串,前端展示用不到 */
  code?: string;
}

interface DictDefinition {
  /** 简短的 enum 名,如 'Gender' / 'GuaranteeType' */
  enumName: string;
  /** 命名空间限定名,如 'cn.byteawake.prh.Gender' */
  qualifiedName?: string;
  members: DictMember[];
}

class DictStore {
  /** key = enumName(短名),value = members */
  private readonly enums: Record<string, DictMember[]> = {};
  loaded = false;
  loading = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.bootstrapFromStaticLabels();
  }

  /** 用 utils/enum-options 中的 EnumLabels 作为默认值 */
  private bootstrapFromStaticLabels() {
    Object.entries(EnumLabels).forEach(([enumName, labels]) => {
      this.enums[enumName] = Object.entries(
        labels as Record<string, string>,
      ).map(([name, label]) => ({ name, label }));
    });
  }

  /** 取某个枚举的全部成员(已按写入顺序) */
  members(enumName: string): DictMember[] {
    return this.enums[enumName] ?? [];
  }

  /** 取某个值的中文 label,缺省返回原值 */
  label(enumName: string, value?: string | null, fallback = '-'): string {
    if (value === undefined || value === null || value === '') return fallback;
    const m = this.members(enumName).find((x) => x.name === value);
    return m?.label ?? value;
  }

  /** 转 antd Select / Radio 用的 options */
  options(enumName: string): { label: string; value: string }[] {
    return this.members(enumName).map((m) => ({
      label: m.label,
      value: m.name,
    }));
  }

  /**
   * 从后端刷新字典(全量覆盖)。
   * 不抛错,后端没有字典服务也不影响业务。
   */
  async refresh(): Promise<boolean> {
    if (this.loading) return this.loaded;
    runInAction(() => {
      this.loading = true;
    });
    try {
      const res = await request<{
        success: boolean;
        data?: DictDefinition[];
      }>('/api/v1/ontology/list', {
        method: 'POST',
        data: {
          objectType: 'cn.byteawake.ap.oms.EnumDefinition',
          payload: { page: { pageNo: 1, pageSize: 1000 } },
        },
        skipErrorHandler: true,
      });
      if (!res?.success || !Array.isArray(res.data)) return false;
      runInAction(() => {
        res.data!.forEach((def) => {
          if (!def?.enumName || !Array.isArray(def.members)) return;
          this.enums[def.enumName] = def.members.map((m) => ({
            name: m.name,
            label: m.label ?? m.name,
            code: m.code,
          }));
        });
        this.loaded = true;
      });
      return true;
    } catch {
      // 后端没实现字典服务 → 静默失败,继续用默认值
      return false;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

export const dictStore = new DictStore();

/**
 * 在组件里取某个枚举的 options。
 * 如果 dictStore 已加载,会自动响应(observable)。
 */
export function useEnumOptions(
  enumName: string,
): { label: string; value: string }[] {
  // 简单实现:返回当前快照,store 是 mobx observable,
  // 调用方在 observer 包裹的组件里能自动响应。
  // 不在 observer 内的组件,可用 [version] 强制重渲染:
  const [, force] = useState(0);
  useEffect(() => {
    // 第一次挂载触发一次刷新(去重靠 store 自身)
    if (!dictStore.loaded && !dictStore.loading) {
      dictStore.refresh().then((ok) => {
        if (ok) force((v) => v + 1);
      });
    }
  }, []);
  return dictStore.options(enumName);
}

/** 在非 hook 处取 label */
export function dictLabel(
  enumName: string,
  value?: string | null,
  fallback = '-',
) {
  return dictStore.label(enumName, value, fallback);
}
