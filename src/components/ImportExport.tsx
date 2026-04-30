import { useCallback, useState } from 'react';
import {
  Clipboard,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { MMKV } from 'react-native-mmkv';
import { useExportImport } from '../hooks/useExportImport';
import type { ImportMode, ImportPreview, ThemeColors } from '../types';

interface ImportExportProps {
  visible: boolean;
  storage: MMKV | null;
  instanceName: string;
  theme: ThemeColors;
  onClose: () => void;
  onImportComplete: () => void;
}

const IMPORT_MODES: { mode: ImportMode; label: string; description: string }[] = [
  { mode: 'overwrite', label: 'Overwrite', description: 'Update existing + add new keys' },
  { mode: 'merge', label: 'Merge', description: "Only add keys that don't exist" },
  { mode: 'replace', label: 'Replace All', description: 'Clear everything, then import' },
];

type Tab = 'export' | 'import';

export function ImportExport({
  visible,
  storage,
  instanceName,
  theme,
  onClose,
  onImportComplete,
}: ImportExportProps) {
  const [activeTab, setActiveTab] = useState<Tab>('export');
  const [importJSON, setImportJSON] = useState('');
  const [importMode, setImportMode] = useState<ImportMode>('overwrite');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportedJSON, setExportedJSON] = useState<string | null>(null);

  const { exportToJSON, previewImport, executeImport } = useExportImport(storage, instanceName);

  const handleExport = useCallback(() => {
    try {
      const json = exportToJSON();
      setExportedJSON(json);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [exportToJSON]);

  const handleCopyExport = useCallback(() => {
    if (exportedJSON) {
      Clipboard.setString(exportedJSON);
    }
  }, [exportedJSON]);

  const handleShareExport = useCallback(async () => {
    if (exportedJSON) {
      await Share.share({ message: exportedJSON });
    }
  }, [exportedJSON]);

  const handlePreviewImport = useCallback(() => {
    try {
      const p = previewImport(importJSON, importMode);
      setPreview(p);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setPreview(null);
    }
  }, [previewImport, importJSON, importMode]);

  const handleApplyImport = useCallback(() => {
    if (!preview) return;
    try {
      executeImport(preview);
      setPreview(null);
      setImportJSON('');
      setError(null);
      onImportComplete();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [preview, executeImport, onImportComplete]);

  const handleClose = useCallback(() => {
    setExportedJSON(null);
    setImportJSON('');
    setPreview(null);
    setError(null);
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable
        style={[styles.overlay, { backgroundColor: theme.modalOverlay }]}
        onPress={handleClose}
      >
        <View
          style={[styles.sheet, { backgroundColor: theme.surface }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Import / Export</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={[styles.closeButton, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tab bar */}
          <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
            {(['export', 'import'] as Tab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && { borderBottomColor: theme.primary }]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === tab ? theme.primary : theme.textMuted,
                    },
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.body}>
            {activeTab === 'export' ? (
              <View>
                {!exportedJSON ? (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                    onPress={handleExport}
                  >
                    <Text style={styles.actionButtonText}>Export All Keys</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <ScrollView
                      style={[
                        styles.jsonPreview,
                        { backgroundColor: theme.background, borderColor: theme.border },
                      ]}
                      nestedScrollEnabled
                    >
                      <Text style={[styles.jsonText, { color: theme.text }]} selectable>
                        {exportedJSON}
                      </Text>
                    </ScrollView>
                    <View style={styles.exportActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, { borderColor: theme.border, borderWidth: 1 }]}
                        onPress={handleCopyExport}
                      >
                        <Text style={[styles.actionButtonText, { color: theme.text }]}>Copy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { borderColor: theme.border, borderWidth: 1 }]}
                        onPress={handleShareExport}
                      >
                        <Text style={[styles.actionButtonText, { color: theme.text }]}>Share</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ) : (
              <View>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Paste JSON</Text>
                <TextInput
                  style={[
                    styles.importInput,
                    {
                      color: theme.text,
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                    },
                  ]}
                  value={importJSON}
                  onChangeText={(text) => {
                    setImportJSON(text);
                    setPreview(null);
                    setError(null);
                  }}
                  multiline
                  numberOfLines={6}
                  placeholder="Paste exported JSON here…"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <Text style={[styles.label, { color: theme.textSecondary }]}>Conflict Mode</Text>
                {IMPORT_MODES.map(({ mode, label, description }) => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.modeOption,
                      {
                        borderColor: importMode === mode ? theme.primary : theme.border,
                        backgroundColor:
                          importMode === mode ? theme.surfaceHighlight : 'transparent',
                      },
                    ]}
                    onPress={() => {
                      setImportMode(mode);
                      setPreview(null);
                    }}
                  >
                    <Text style={[styles.modeLabel, { color: theme.text }]}>{label}</Text>
                    <Text style={[styles.modeDesc, { color: theme.textMuted }]}>{description}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: importJSON.trim() ? theme.primary : theme.textMuted,
                    },
                  ]}
                  onPress={handlePreviewImport}
                  disabled={!importJSON.trim()}
                >
                  <Text style={styles.actionButtonText}>Preview Import</Text>
                </TouchableOpacity>

                {preview && (
                  <View
                    style={[
                      styles.previewBox,
                      { backgroundColor: theme.background, borderColor: theme.border },
                    ]}
                  >
                    <Text style={[styles.previewTitle, { color: theme.text }]}>Import Preview</Text>
                    <Text style={[styles.previewLine, { color: theme.badgeString }]}>
                      + {preview.newKeys.length} new keys
                    </Text>
                    <Text style={[styles.previewLine, { color: theme.badgeNumber }]}>
                      ~ {preview.updatedKeys.length} updated keys
                    </Text>
                    <Text style={[styles.previewLine, { color: theme.textMuted }]}>
                      = {preview.unchangedKeys.length} unchanged
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: theme.primary, marginTop: 12 },
                      ]}
                      onPress={handleApplyImport}
                    >
                      <Text style={styles.actionButtonText}>Apply Import</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {error && <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>}
          </ScrollView>
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
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  body: {
    padding: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 12,
  },
  importInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    fontFamily: 'monospace',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  modeOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  modeDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  jsonPreview: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  jsonText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  exportActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  previewBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  previewLine: {
    fontSize: 13,
    marginBottom: 2,
  },
  error: {
    fontSize: 12,
    marginTop: 8,
  },
});
