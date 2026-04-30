import type { MMKV } from 'react-native-mmkv';

export type MMKVValueType = 'string' | 'number' | 'boolean' | 'binary';

export interface MMKVEntry {
  key: string;
  type: MMKVValueType;
  value: string | number | boolean | Uint8Array;
}

export interface InstanceDescriptor {
  name: string;
  storage: MMKV;
}

export interface ExportEnvelope {
  version: 1;
  instanceName: string;
  exportedAt: string;
  entries: Record<string, { type: MMKVValueType; value: string | number | boolean }>;
}

export type ImportMode = 'merge' | 'overwrite' | 'replace';

export interface ImportPreview {
  newKeys: string[];
  updatedKeys: string[];
  unchangedKeys: string[];
  totalEntries: number;
  mode: ImportMode;
  entries: Record<string, { type: MMKVValueType; value: string | number | boolean }>;
}

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHighlight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  danger: string;
  badgeString: string;
  badgeNumber: string;
  badgeBoolean: string;
  badgeBinary: string;
  badgeText: string;
  modalOverlay: string;
}

export type ThemeOverrides = Partial<ThemeColors>;
