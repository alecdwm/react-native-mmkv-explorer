import type { MMKV } from 'react-native-mmkv';
import type { ExportEnvelope, ImportMode, ImportPreview, MMKVEntry, MMKVValueType } from '../types';
import { resolveValue, setValue, valueToString } from './typeDetection';

export function toExportEnvelope(instanceName: string, entries: MMKVEntry[]): ExportEnvelope {
  const exportEntries: ExportEnvelope['entries'] = {};

  for (const entry of entries) {
    exportEntries[entry.key] = {
      type: entry.type,
      value:
        entry.type === 'binary' && entry.value instanceof Uint8Array
          ? valueToString(entry)
          : (entry.value as string | number | boolean),
    };
  }

  return {
    version: 1,
    instanceName,
    exportedAt: new Date().toISOString(),
    entries: exportEntries,
  };
}

export function parseExportEnvelope(json: string): ExportEnvelope {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid JSON');
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('version' in parsed) ||
    !('entries' in parsed)
  ) {
    throw new Error('Invalid export format: missing required fields');
  }

  const envelope = parsed as ExportEnvelope;
  if (envelope.version !== 1) {
    throw new Error(`Unsupported export version: ${envelope.version}`);
  }

  const validTypes: MMKVValueType[] = ['string', 'number', 'boolean', 'binary'];
  for (const [key, entry] of Object.entries(envelope.entries)) {
    if (!validTypes.includes(entry.type)) {
      throw new Error(`Invalid type "${entry.type}" for key "${key}"`);
    }
  }

  return envelope;
}

export function generateImportPreview(
  storage: MMKV,
  envelope: ExportEnvelope,
  mode: ImportMode,
): ImportPreview {
  const existingKeys = new Set(storage.getAllKeys());
  const newKeys: string[] = [];
  const updatedKeys: string[] = [];
  const unchangedKeys: string[] = [];

  for (const [key, entry] of Object.entries(envelope.entries)) {
    if (!existingKeys.has(key)) {
      newKeys.push(key);
    } else if (mode === 'merge') {
      unchangedKeys.push(key);
    } else {
      const existing = resolveValue(storage, key);
      if (
        existing &&
        existing.type === entry.type &&
        valueToString(existing) === String(entry.value)
      ) {
        unchangedKeys.push(key);
      } else {
        updatedKeys.push(key);
      }
    }
  }

  return {
    newKeys,
    updatedKeys,
    unchangedKeys,
    totalEntries: Object.keys(envelope.entries).length,
    mode,
    entries: envelope.entries,
  };
}

export function applyImport(storage: MMKV, preview: ImportPreview): void {
  if (preview.mode === 'replace') {
    storage.clearAll();
  }

  const keysToWrite =
    preview.mode === 'merge' ? preview.newKeys : [...preview.newKeys, ...preview.updatedKeys];

  for (const key of keysToWrite) {
    const entry = preview.entries[key];
    if (entry) {
      setValue(storage, key, entry.type, String(entry.value));
    }
  }
}

export function exportAllEntries(storage: MMKV): MMKVEntry[] {
  const keys = storage.getAllKeys();
  const entries: MMKVEntry[] = [];

  for (const key of keys) {
    const entry = resolveValue(storage, key);
    if (entry) {
      entries.push(entry);
    }
  }

  return entries;
}
