import type { ThemeColors, ThemeOverrides } from '../types';

export const DEFAULT_THEME: ThemeColors = {
  background: '#1a1a2e',
  surface: '#16213e',
  surfaceHighlight: '#1f2b47',
  text: '#e0e0e0',
  textSecondary: '#a0a0b0',
  textMuted: '#606070',
  border: '#2a2a4a',
  primary: '#4a9eff',
  danger: '#ff4a6a',
  badgeString: '#4ade80',
  badgeNumber: '#60a5fa',
  badgeBoolean: '#f59e0b',
  badgeBinary: '#a78bfa',
  badgeText: '#1a1a2e',
  modalOverlay: 'rgba(0, 0, 0, 0.7)',
};

export function mergeTheme(overrides?: ThemeOverrides): ThemeColors {
  if (!overrides) return DEFAULT_THEME;
  return { ...DEFAULT_THEME, ...overrides };
}
