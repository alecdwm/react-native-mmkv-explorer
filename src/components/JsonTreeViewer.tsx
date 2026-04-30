import { useCallback, useMemo, useState } from 'react';
import {
  Clipboard,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  getJsonBadgeColor,
  getJsonDisplayType,
  getJsonValuePreview,
  JSON_TYPE_LABELS,
} from '../constants';
import type { ThemeColors } from '../types';

interface JsonTreeViewerProps {
  visible: boolean;
  json: Record<string, unknown> | unknown[];
  mmkvKey: string;
  theme: ThemeColors;
  onClose: () => void;
  onEdit: () => void;
}

interface JsonRow {
  key: string;
  value: unknown;
}

function getEntries(node: unknown): JsonRow[] {
  if (Array.isArray(node)) {
    return node.map((v, i) => ({ key: String(i), value: v }));
  }
  if (typeof node === 'object' && node !== null) {
    return Object.entries(node as Record<string, unknown>).map(([k, v]) => ({
      key: k,
      value: v,
    }));
  }
  return [];
}

export function JsonTreeViewer({
  visible,
  json,
  mmkvKey,
  theme,
  onClose,
  onEdit,
}: JsonTreeViewerProps) {
  const [path, setPath] = useState<string[]>([]);

  const currentNode = useMemo(() => {
    let node: unknown = json;
    for (const segment of path) {
      if (Array.isArray(node)) {
        node = node[Number(segment)];
      } else if (typeof node === 'object' && node !== null) {
        node = (node as Record<string, unknown>)[segment];
      } else {
        return undefined;
      }
    }
    return node;
  }, [json, path]);

  const isContainer =
    currentNode !== null && currentNode !== undefined && typeof currentNode === 'object';

  const entries = useMemo(
    () => (isContainer ? getEntries(currentNode) : []),
    [currentNode, isContainer],
  );

  const handleRowPress = useCallback((row: JsonRow) => {
    const type = getJsonDisplayType(row.value);
    if (type === 'object' || type === 'array') {
      setPath((p) => [...p, row.key]);
    }
  }, []);

  const handleBreadcrumbTap = useCallback((index: number) => {
    // index -1 means root
    setPath((p) => p.slice(0, index + 1));
  }, []);

  const handleCopy = useCallback(() => {
    Clipboard.setString(JSON.stringify(currentNode, null, 2));
  }, [currentNode]);

  const handleClose = useCallback(() => {
    setPath([]);
    onClose();
  }, [onClose]);

  const handleEdit = useCallback(() => {
    setPath([]);
    onEdit();
  }, [onEdit]);

  const breadcrumbs = ['root', ...path];

  const renderRow = useCallback(
    ({ item }: { item: JsonRow }) => {
      const type = getJsonDisplayType(item.value);
      const badgeColor = getJsonBadgeColor(type, theme);
      const label = JSON_TYPE_LABELS[type];
      const preview = getJsonValuePreview(item.value);
      const isDrillable = type === 'object' || type === 'array';

      return (
        <TouchableOpacity
          style={[styles.row, { borderBottomColor: theme.border }]}
          onPress={() => handleRowPress(item)}
          activeOpacity={isDrillable ? 0.7 : 1}
        >
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={[styles.badgeText, { color: theme.badgeText }]}>{label}</Text>
          </View>
          <View style={styles.rowContent}>
            <Text style={[styles.rowKey, { color: theme.text }]} numberOfLines={1}>
              {item.key}
            </Text>
            <Text style={[styles.rowValue, { color: theme.textSecondary }]} numberOfLines={1}>
              {preview}
            </Text>
          </View>
          {isDrillable && <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>}
        </TouchableOpacity>
      );
    },
    [theme, handleRowPress],
  );

  const keyExtractor = useCallback((item: JsonRow) => item.key, []);

  // Primitive value at current node
  const primitiveDisplay = !isContainer && currentNode !== undefined;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.overlay, { backgroundColor: theme.modalOverlay }]}>
        <View style={[styles.viewer, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {path.length > 0 && (
                <TouchableOpacity
                  onPress={() => setPath((p) => p.slice(0, -1))}
                  style={styles.backButton}
                >
                  <Text style={[styles.backText, { color: theme.primary }]}>‹</Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                {mmkvKey}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Text style={[styles.closeButton, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Breadcrumb */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.breadcrumbContainer}
            contentContainerStyle={styles.breadcrumbContent}
          >
            {breadcrumbs.map((segment, idx) => {
              const stableKey = breadcrumbs.slice(0, idx + 1).join('/');
              return (
                <TouchableOpacity key={stableKey} onPress={() => handleBreadcrumbTap(idx - 1)}>
                  <Text
                    style={[
                      styles.breadcrumbText,
                      {
                        color: idx === breadcrumbs.length - 1 ? theme.text : theme.primary,
                      },
                    ]}
                  >
                    {idx > 0 ? ` › ${segment}` : segment}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Content */}
          {isContainer ? (
            <FlatList
              data={entries}
              renderItem={renderRow}
              keyExtractor={keyExtractor}
              style={styles.list}
            />
          ) : primitiveDisplay ? (
            <View
              style={[
                styles.primitiveContainer,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}
            >
              <View style={styles.primitiveMeta}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: getJsonBadgeColor(getJsonDisplayType(currentNode), theme),
                    },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: theme.badgeText }]}>
                    {JSON_TYPE_LABELS[getJsonDisplayType(currentNode)]}
                  </Text>
                </View>
              </View>
              <ScrollView style={styles.primitiveScroll}>
                <Text style={[styles.primitiveText, { color: theme.text }]} selectable>
                  {String(currentNode)}
                </Text>
              </ScrollView>
            </View>
          ) : null}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.footerButton, { borderColor: theme.border }]}
              onPress={handleCopy}
            >
              <Text style={[styles.footerButtonText, { color: theme.text }]}>📋 Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: theme.primary }]}
              onPress={handleEdit}
            >
              <Text style={[styles.footerButtonText, { color: '#fff' }]}>✏️ Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  viewer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  backButton: {
    paddingRight: 8,
  },
  backText: {
    fontSize: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '600',
  },
  breadcrumbContainer: {
    maxHeight: 32,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  breadcrumbContent: {
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: 13,
    fontWeight: '500',
  },
  list: {
    flexGrow: 0,
    flexShrink: 1,
  },
  row: {
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
  rowContent: {
    flex: 1,
  },
  rowKey: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 12,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
  },
  primitiveContainer: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  primitiveMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  primitiveScroll: {
    maxHeight: 200,
  },
  primitiveText: {
    fontSize: 13,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
  },
  footerButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
