import { useCallback, useMemo, useState } from 'react';
import type { MMKV } from 'react-native-mmkv';

export function useKeyList(storage: MMKV | null) {
  const [keys, setKeys] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);

  const refresh = useCallback(() => {
    if (!storage) {
      setKeys([]);
      return;
    }
    const allKeys = storage.getAllKeys();
    allKeys.sort();
    setKeys(allKeys);
    setRefreshCount((c) => c + 1);
  }, [storage]);

  const filteredKeys = useMemo(() => {
    if (!searchQuery.trim()) return keys;
    const query = searchQuery.toLowerCase();
    return keys.filter((key) => key.toLowerCase().includes(query));
  }, [keys, searchQuery]);

  return {
    keys,
    filteredKeys,
    searchQuery,
    setSearchQuery,
    refresh,
    refreshCount,
    totalCount: keys.length,
    filteredCount: filteredKeys.length,
  };
}
