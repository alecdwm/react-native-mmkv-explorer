import type { MMKVValueType, ThemeColors } from './types';

export const TYPE_LABELS: Record<MMKVValueType, string> = {
  string: 'STR',
  number: 'NUM',
  boolean: 'BOOL',
  binary: 'BIN',
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
