import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../app/providers/ThemeProvider';
import { BorderRadius, Spacing } from '../../theme';

export interface BannerProps {
  title?: string;
  message: string;
  type?: 'info' | 'warning' | 'critical' | 'success';
  style?: ViewStyle;
}

export const Banner: React.FC<BannerProps> = ({
  title,
  message,
  type = 'info',
  style,
}) => {
  const { colors } = useTheme();

  const getConfig = () => {
    switch (type) {
      case 'warning':
        return {
          bg: colors.warningBg,
          border: colors.warningBorder,
          text: colors.warning,
          icon: 'warning-outline' as const,
        };
      case 'critical':
        return {
          bg: colors.criticalBg,
          border: colors.criticalBorder,
          text: colors.critical,
          icon: 'alert-circle-outline' as const,
        };
      case 'success':
        return {
          bg: colors.successBg,
          border: colors.successBorder,
          text: colors.success,
          icon: 'checkmark-circle-outline' as const,
        };
      case 'info':
      default:
        return {
          bg: colors.infoBg,
          border: colors.infoBorder,
          text: colors.info,
          icon: 'information-circle-outline' as const,
        };
    }
  };

  const { bg, border, text, icon } = getConfig();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderColor: border,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={20} color={text} style={styles.icon} />
      <View style={styles.content}>
        {title ? (
          <Text style={[styles.title, { color: text }]}>{title}</Text>
        ) : null}
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  icon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
});
