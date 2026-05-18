import { useEffect, useState, useCallback } from 'react';

export interface UseDetailResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

/**
 * 详情页通用数据获取 hook
 *
 * 用法:
 *   const { data, loading, reload } = useDetail(id, residentService.detail);
 */
export function useDetail<T>(
  id: string | undefined,
  fetcher: (id: string) => Promise<T>,
): UseDetailResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher(id);
      setData(result);
    } catch (err) {
      setError(err as Error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id, fetcher]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}
