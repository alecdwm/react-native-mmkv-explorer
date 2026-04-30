import { useCallback, useMemo, useState } from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ImportExport } from './components/ImportExport';
import { InstancePicker } from './components/InstancePicker';
import { KeyList } from './components/KeyList';
import { ValueEditor } from './components/ValueEditor';
import { ValueViewer } from './components/ValueViewer';
import type { InstanceDescriptor, MMKVEntry, MMKVValueType, ThemeOverrides } from './types';
import { mergeTheme } from './utils/theme';
import { resolveValue, setValue, valueToString } from './utils/typeDetection';

export interface MMKVExplorerProps {
  instances: InstanceDescriptor[];
  visible: boolean;
  onClose: () => void;
  theme?: ThemeOverrides;
}

export function MMKVExplorer({
  instances,
  visible,
  onClose,
  theme: themeOverrides,
}: MMKVExplorerProps) {
  const theme = useMemo(() => mergeTheme(themeOverrides), [themeOverrides]);

  const [activeInstanceIndex, setActiveInstanceIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<MMKVEntry | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [isNewKey, setIsNewKey] = useState(false);
  const [importExportVisible, setImportExportVisible] = useState(false);
  const [deleteConfirmKey, setDeleteConfirmKey] = useState<string | null>(null);
  const [clearAllConfirmVisible, setClearAllConfirmVisible] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const activeInstance = instances[activeInstanceIndex] ?? null;
  const storage = activeInstance?.storage ?? null;

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((c) => c + 1);
  }, []);

  const handleSelectKey = useCallback(
    (key: string) => {
      if (!storage) return;
      const entry = resolveValue(storage, key);
      setSelectedKey(key);
      setSelectedEntry(entry ?? null);
      setViewerVisible(true);
    },
    [storage],
  );

  const handleDeleteKey = useCallback((key: string) => {
    setDeleteConfirmKey(key);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!storage || !deleteConfirmKey) return;
    storage.delete(deleteConfirmKey);
    setDeleteConfirmKey(null);
    triggerRefresh();
  }, [storage, deleteConfirmKey, triggerRefresh]);

  const handleAddKey = useCallback(() => {
    setSelectedKey(null);
    setSelectedEntry(null);
    setIsNewKey(true);
    setEditorVisible(true);
  }, []);

  const handleEditFromViewer = useCallback(() => {
    setViewerVisible(false);
    setIsNewKey(false);
    setEditorVisible(true);
  }, []);

  const handleSave = useCallback(
    (key: string, type: MMKVValueType, value: string) => {
      if (!storage) return;
      setValue(storage, key, type, value);
      setEditorVisible(false);
      triggerRefresh();
    },
    [storage, triggerRefresh],
  );

  const handleClearAll = useCallback(() => {
    if (!storage) return;
    storage.clearAll();
    setClearAllConfirmVisible(false);
    triggerRefresh();
  }, [storage, triggerRefresh]);

  const handleInstanceChange = useCallback((index: number) => {
    setActiveInstanceIndex(index);
    setSelectedKey(null);
    setSelectedEntry(null);
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>MMKV Explorer</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setImportExportVisible(true)}
            >
              <Text style={[styles.headerButtonText, { color: theme.primary }]}>⇄</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setClearAllConfirmVisible(true)}
            >
              <Text style={[styles.headerButtonText, { color: theme.danger }]}>🗑</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <Text style={[styles.headerButtonText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Instance Picker */}
        <InstancePicker
          instances={instances}
          activeIndex={activeInstanceIndex}
          onSelect={handleInstanceChange}
          theme={theme}
        />

        {/* Key List */}
        <KeyList
          storage={storage}
          theme={theme}
          onSelectKey={handleSelectKey}
          onDeleteKey={handleDeleteKey}
          onAddKey={handleAddKey}
          refreshTrigger={refreshTrigger}
        />

        {/* Value Viewer */}
        <ValueViewer
          visible={viewerVisible}
          entry={selectedEntry}
          theme={theme}
          onClose={() => setViewerVisible(false)}
          onEdit={handleEditFromViewer}
        />

        {/* Value Editor */}
        <ValueEditor
          visible={editorVisible}
          initialKey={selectedKey ?? ''}
          initialType={selectedEntry?.type ?? 'string'}
          initialValue={selectedEntry ? valueToString(selectedEntry) : ''}
          isNewKey={isNewKey}
          theme={theme}
          onSave={handleSave}
          onCancel={() => setEditorVisible(false)}
        />

        {/* Import/Export */}
        <ImportExport
          visible={importExportVisible}
          storage={storage}
          instanceName={activeInstance?.name ?? 'default'}
          theme={theme}
          onClose={() => setImportExportVisible(false)}
          onImportComplete={() => {
            setImportExportVisible(false);
            triggerRefresh();
          }}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          visible={deleteConfirmKey !== null}
          title="Delete Key"
          message={`Are you sure you want to delete "${deleteConfirmKey}"?`}
          confirmLabel="Delete"
          destructive
          theme={theme}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmKey(null)}
        />

        {/* Clear All Confirmation */}
        <ConfirmDialog
          visible={clearAllConfirmVisible}
          title="Clear All Keys"
          message={`This will delete ALL keys in "${activeInstance?.name ?? 'default'}". This action cannot be undone.`}
          confirmLabel="Clear All"
          confirmTypeText={activeInstance?.name ?? 'default'}
          destructive
          theme={theme}
          onConfirm={handleClearAll}
          onCancel={() => setClearAllConfirmVisible(false)}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 18,
  },
});
