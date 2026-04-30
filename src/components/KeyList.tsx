import { useCallback, useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { MMKV } from 'react-native-mmkv';
import { useKeyList } from '../hooks/useKeyList';
import { useValueResolver } from '../hooks/useValueResolver';
import type { ThemeColors } from '../types';
import { KeyValueRow } from './KeyValueRow';
import { SearchBar } from './SearchBar';

interface KeyListProps {
  storage: MMKV | null;
  theme: ThemeColors;
  onSelectKey: (key: string) => void;
  onDeleteKey: (key: string) => void;
  onAddKey: () => void;
  refreshTrigger: number;
}

export function KeyList({
  storage,
  theme,
  onSelectKey,
  onDeleteKey,
  onAddKey,
  refreshTrigger,
}: KeyListProps) {
  const { filteredKeys, searchQuery, setSearchQuery, refresh, totalCount, filteredCount } =
    useKeyList(storage);

  const { resolve, invalidateAll } = useValueResolver(storage);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshTrigger is an intentional dependency to force re-fetching when values change
  useEffect(() => {
    refresh();
    invalidateAll();
  }, [refresh, invalidateAll, refreshTrigger]);

  const renderItem = useCallback(
    ({ item: key }: { item: string }) => {
      const entry = resolve(key);
      return (
        <KeyValueRow
          keyName={key}
          entry={entry}
          theme={theme}
          onPress={onSelectKey}
          onLongPress={onDeleteKey}
        />
      );
    },
    [resolve, theme, onSelectKey, onDeleteKey],
  );

  const keyExtractor = useCallback((item: string) => item, []);

  return (
    <View style={styles.container}>
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} theme={theme} />
      <View style={[styles.statusBar, { borderBottomColor: theme.border }]}>
        <Text style={[styles.statusText, { color: theme.textMuted }]}>
          {searchQuery ? `${filteredCount} of ${totalCount} keys` : `${totalCount} keys`}
        </Text>
        <TouchableOpacity onPress={onAddKey}>
          <Text style={[styles.addButton, { color: theme.primary }]}>+ Add Key</Text>
        </TouchableOpacity>
      </View>
      {filteredKeys.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            {totalCount === 0 ? 'No keys stored' : 'No keys match your search'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredKeys}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          style={styles.list}
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={5}
          onRefresh={() => {
            refresh();
            invalidateAll();
          }}
          refreshing={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statusText: {
    fontSize: 12,
  },
  addButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
  },
});
