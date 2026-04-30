import type { ThemeColors, ThemeOverrides } from '../types';

export const DEFAULT_THEME: ThemeColors = {
  background: '#111111',
  surface: '#1a1a1a',
  surfaceHighlight: '#242424',
  text: '#e0e0e0',
  textSecondary: '#999999',
  textMuted: '#666666',
  border: '#333333',
  primary: '#cccccc',
  danger: '#999999',
  badgeString: '#b0b0b0',
  badgeNumber: '#d0d0d0',
  badgeBoolean: '#909090',
  badgeBinary: '#707070',
  badgeJson: '#e0e0e0',
  badgeText: '#111111',
  modalOverlay: 'rgba(0, 0, 0, 0.75)',
};

export function mergeTheme(overrides?: ThemeOverrides): ThemeColors {
  if (!overrides) return DEFAULT_THEME;
  return { ...DEFAULT_THEME, ...overrides };
}
