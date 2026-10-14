import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../app/providers/ThemeProvider';
import { BorderRadius, Spacing } from '../../theme';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'critical' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const { colors } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.successBg, text: colors.success, border: colors.successBorder };
      case 'warning':
        return { bg: colors.warningBg, text: colors.warning, border: colors.warningBorder };
      case 'critical':
        return { bg: colors.criticalBg, text: colors.critical, border: colors.criticalBorder };
      case 'info':
        return { bg: colors.infoBg, text: colors.info, border: colors.infoBorder };
      case 'neutral':
        return { bg: colors.surfaceVariant, text: colors.textSecondary, border: colors.surfaceBorder };
      case 'primary':
      default:
        return { bg: colors.badgeBackground, text: colors.primaryLight, border: colors.surfaceBorderFocused };
    }
  };

  const { bg, text, border } = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
          paddingVertical: isSm ? 2 : Spacing.xs,
          paddingHorizontal: isSm ? Spacing.sm : Spacing.md,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: text,
            fontSize: isSm ? 11 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
