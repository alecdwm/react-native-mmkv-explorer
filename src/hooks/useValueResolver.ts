import { useCallback, useRef } from 'react';
import type { MMKV } from 'react-native-mmkv';
import type { MMKVEntry } from '../types';
import { resolveValue } from '../utils/typeDetection';

export function useValueResolver(storage: MMKV | null) {
  const cacheRef = useRef<Map<string, MMKVEntry>>(new Map());

  const resolve = useCallback(
    (key: string): MMKVEntry | undefined => {
      if (!storage) return undefined;

      const cached = cacheRef.current.get(key);
      if (cached) return cached;

      const entry = resolveValue(storage, key);
      if (entry) {
        cacheRef.current.set(key, entry);
      }
      return entry;
    },
    [storage],
  );

  const invalidate = useCallback((key?: string) => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  const invalidateAll = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return { resolve, invalidate, invalidateAll };
}
