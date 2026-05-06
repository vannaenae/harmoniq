import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle, View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Radius } from '../../constants/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: Colors.p800, borderWidth: 0 },
    text: { color: Colors.white },
  },
  secondary: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: Colors.p800,
    },
    text: { color: Colors.p800 },
  },
  ghost: {
    container: { backgroundColor: 'transparent', borderWidth: 0 },
    text: { color: Colors.p800 },
  },
  danger: {
    container: { backgroundColor: Colors.error, borderWidth: 0 },
    text: { color: Colors.white },
  },
};

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  sm: { container: { paddingVertical: 8, paddingHorizontal: 16 }, text: { fontSize: 13 } },
  md: { container: { paddingVertical: 14, paddingHorizontal: 24 }, text: { fontSize: 15 } },
  lg: { container: { paddingVertical: 18, paddingHorizontal: 32 }, text: { fontSize: 16 } },
};

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
}) => {
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];
  const opacity = disabled || isLoading ? 0.5 : 1;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[
        styles.base,
        vs.container,
        ss.container,
        fullWidth && styles.fullWidth,
        { opacity },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : Colors.p800} size="small" />
      ) : (
        <View style={styles.row}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={[styles.text, Typography.bodyMed, vs.text, ss.text]}>{label}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { fontWeight: '600' },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
});
