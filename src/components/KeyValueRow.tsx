import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getBadgeColor, TYPE_LABELS } from '../constants';
import type { MMKVEntry, ThemeColors } from '../types';
import { truncateValue } from '../utils/typeDetection';

interface KeyValueRowProps {
  entry: MMKVEntry | undefined;
  keyName: string;
  theme: ThemeColors;
  onPress: (key: string) => void;
  onLongPress: (key: string) => void;
}

export function KeyValueRow({ entry, keyName, theme, onPress, onLongPress }: KeyValueRowProps) {
  const preview = useMemo(() => {
    if (!entry) return '…';
    return truncateValue(entry);
  }, [entry]);

  const badgeColor = entry ? getBadgeColor(entry.type, theme) : theme.textMuted;
  const typeLabel = entry ? TYPE_LABELS[entry.type] : '?';

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: theme.border }]}
      onPress={() => onPress(keyName)}
      onLongPress={() => onLongPress(keyName)}
      activeOpacity={0.7}
    >
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={[styles.badgeText, { color: theme.badgeText }]}>{typeLabel}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.key, { color: theme.text }]} numberOfLines={1}>
          {keyName}
        </Text>
        <Text style={[styles.value, { color: theme.textSecondary }]} numberOfLines={1}>
          {preview}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 10,
    minWidth: 40,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  key: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
  },
});
