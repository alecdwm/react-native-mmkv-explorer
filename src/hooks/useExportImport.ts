import { useCallback } from 'react';
import type { MMKV } from 'react-native-mmkv';
import type { ExportEnvelope, ImportMode, ImportPreview } from '../types';
import {
  applyImport,
  exportAllEntries,
  generateImportPreview,
  parseExportEnvelope,
  toExportEnvelope,
} from '../utils/serialization';

export function useExportImport(storage: MMKV | null, instanceName: string) {
  const exportToJSON = useCallback((): string => {
    if (!storage) throw new Error('No storage instance');
    const entries = exportAllEntries(storage);
    const envelope = toExportEnvelope(instanceName, entries);
    return JSON.stringify(envelope, null, 2);
  }, [storage, instanceName]);

  const previewImport = useCallback(
    (json: string, mode: ImportMode): ImportPreview => {
      if (!storage) throw new Error('No storage instance');
      const envelope: ExportEnvelope = parseExportEnvelope(json);
      return generateImportPreview(storage, envelope, mode);
    },
    [storage],
  );

  const executeImport = useCallback(
    (preview: ImportPreview): void => {
      if (!storage) throw new Error('No storage instance');
      applyImport(storage, preview);
    },
    [storage],
  );

  return { exportToJSON, previewImport, executeImport };
}
