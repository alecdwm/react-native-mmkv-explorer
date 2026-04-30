import type { MMKVValueType, ThemeColors } from './types';

export const TYPE_LABELS: Record<MMKVValueType, string> = {
  string: 'STR',
  number: 'NUM',
  boolean: 'BOOL',
  binary: 'BIN',
};

export type JsonDisplayType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

export const JSON_TYPE_LABELS: Record<JsonDisplayType, string> = {
  object: 'OBJ',
  array: 'ARR',
  string: 'STR',
  number: 'NUM',
  boolean: 'BOOL',
  null: 'NULL',
};

export function getBadgeColor(type: MMKVValueType, theme: ThemeColors): string {
  switch (type) {
    case 'string':
      return theme.badgeString;
    case 'number':
      return theme.badgeNumber;
    case 'boolean':
      return theme.badgeBoolean;
    case 'binary':
      return theme.badgeBinary;
  }
}

export function getJsonBadgeColor(type: JsonDisplayType, theme: ThemeColors): string {
  switch (type) {
    case 'object':
      return theme.badgeJson;
    case 'array':
      return theme.badgeJson;
    case 'string':
      return theme.badgeString;
    case 'number':
      return theme.badgeNumber;
    case 'boolean':
      return theme.badgeBoolean;
    case 'null':
      return theme.textMuted;
  }
}

export function getJsonDisplayType(value: unknown): JsonDisplayType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  switch (typeof value) {
    case 'object':
      return 'object';
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    default:
      return 'string';
  }
}

export function getJsonValuePreview(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `[${value.length} item${value.length === 1 ? '' : 's'}]`;
  if (typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>);
    return `{${keys.length} key${keys.length === 1 ? '' : 's'}}`;
  }
  return String(value);
}
