import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../app/providers/ThemeProvider';
import { BorderRadius, Spacing } from '../../theme';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'outlined' | 'elevated';
  borderColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  borderColor,
}) => {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderColor: borderColor || colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...(variant === 'elevated'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 3,
        }
      : {
          shadowColor: '#64748B',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 1,
        }),
  };

  const handlePress = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const activeEl = document.activeElement as HTMLElement | null;
      activeEl?.blur?.();
    }
    onPress?.();
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        style={[containerStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
};
