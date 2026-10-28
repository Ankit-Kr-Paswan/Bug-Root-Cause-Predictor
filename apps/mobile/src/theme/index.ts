/**
 * Theme & Color System for Bug Root Cause Predictor
 * Designed for professional developer tooling aesthetics with dark and light themes.
 */

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceBorder: string;
  surfaceBorderFocused: string;
  
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryForeground: string;

  secondary: string;
  secondaryLight: string;
  secondaryForeground: string;

  text: string;
  textSecondary: string;
  textMuted: string;

  // Status & Severity Colors
  critical: string;
  criticalBg: string;
  criticalBorder: string;

  warning: string;
  warningBg: string;
  warningBorder: string;

  success: string;
  successBg: string;
  successBorder: string;

  info: string;
  infoBg: string;
  infoBorder: string;

  codeBackground: string;
  codeText: string;
  codeKeyword: string;
  codeLineNumber: string;

  badgeBackground: string;
  badgeText: string;
}

export const DarkThemeColors: ThemeColors = {
  background: '#0B0F19',
  surface: '#111827',
  surfaceVariant: '#1F2937',
  surfaceBorder: '#374151',
  surfaceBorderFocused: '#60A5FA',

  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#1D4ED8',
  primaryForeground: '#FFFFFF',

  secondary: '#10B981',
  secondaryLight: '#34D399',
  secondaryForeground: '#FFFFFF',

  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textMuted: '#9CA3AF',

  critical: '#F87171',
  criticalBg: 'rgba(239, 68, 68, 0.15)',
  criticalBorder: 'rgba(239, 68, 68, 0.4)',

  warning: '#FBBF24',
  warningBg: 'rgba(245, 158, 11, 0.15)',
  warningBorder: 'rgba(245, 158, 11, 0.4)',

  success: '#34D399',
  successBg: 'rgba(16, 185, 129, 0.15)',
  successBorder: 'rgba(16, 185, 129, 0.4)',

  info: '#38BDF8',
  infoBg: 'rgba(56, 189, 248, 0.15)',
  infoBorder: 'rgba(56, 189, 248, 0.4)',

  codeBackground: '#030712',
  codeText: '#E5E7EB',
  codeKeyword: '#93C5FD',
  codeLineNumber: '#6B7280',

  badgeBackground: '#1F2937',
  badgeText: '#93C5FD',
};

export const LightThemeColors: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  surfaceBorder: '#E2E8F0',
  surfaceBorderFocused: '#3867F6',

  primary: '#3867F6',
  primaryLight: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryForeground: '#FFFFFF',

  secondary: '#10B981',
  secondaryLight: '#059669',
  secondaryForeground: '#FFFFFF',

  text: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',

  critical: '#DC2626',
  criticalBg: '#FEF2F2',
  criticalBorder: '#FCA5A5',

  warning: '#D97706',
  warningBg: '#FFFBEB',
  warningBorder: '#FDE68A',

  success: '#16A34A',
  successBg: '#F0FDF4',
  successBorder: '#BBF7D0',

  info: '#0284C7',
  infoBg: '#F0F9FF',
  infoBorder: '#BAE6FD',

  codeBackground: '#0F172A',
  codeText: '#F8FAFC',
  codeKeyword: '#93C5FD',
  codeLineNumber: '#64748B',

  badgeBackground: '#EFF6FF',
  badgeText: '#1D4ED8',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const Typography = {
  titleLarge: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  titleMedium: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  titleSmall: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  code: {
    fontFamily: 'Courier',
    fontSize: 13,
    lineHeight: 18,
  },
};
