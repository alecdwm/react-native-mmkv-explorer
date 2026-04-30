import {
  Clipboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getBadgeColor, TYPE_LABELS } from '../constants';
import type { MMKVEntry, ThemeColors } from '../types';
import { valueToString } from '../utils/typeDetection';

interface ValueViewerProps {
  visible: boolean;
  entry: MMKVEntry | null;
  theme: ThemeColors;
  onClose: () => void;
  onEdit: () => void;
}

export function ValueViewer({ visible, entry, theme, onClose, onEdit }: ValueViewerProps) {
  if (!entry) return null;

  const fullValue = valueToString(entry);
  const badgeColor = getBadgeColor(entry.type, theme);

  const handleCopy = () => {
    Clipboard.setString(fullValue);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.overlay, { backgroundColor: theme.modalOverlay }]}
        onPress={onClose}
      >
        <View
          style={[styles.viewer, { backgroundColor: theme.surface }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
              {entry.key}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={[styles.badgeText, { color: theme.badgeText }]}>
                {TYPE_LABELS[entry.type]}
              </Text>
            </View>
            <Text style={[styles.meta, { color: theme.textMuted }]}>
              {entry.type === 'binary' && entry.value instanceof Uint8Array
                ? `${entry.value.length} bytes`
                : `${fullValue.length} chars`}
            </Text>
          </View>

          <ScrollView
            style={[
              styles.valueContainer,
              { backgroundColor: theme.background, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.valueText, { color: theme.text }]} selectable>
              {fullValue}
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.footerButton, { borderColor: theme.border }]}
              onPress={handleCopy}
            >
              <Text style={[styles.footerButtonText, { color: theme.text }]}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: theme.primary }]}
              onPress={onEdit}
            >
              <Text style={[styles.footerButtonText, { color: theme.badgeText }]}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
  },
  valueContainer: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
  },
  valueText: {
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
