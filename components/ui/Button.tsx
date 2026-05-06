import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
}

const sizeMap: Record<Size, { height: number; fontSize: number; px: number }> = {
  sm: { height: 36, fontSize: 13, px: Spacing.base },
  md: { height: 44, fontSize: 14, px: Spacing.lg   },
  lg: { height: 54, fontSize: 15, px: Spacing.xl   },
};

export const Button: React.FC<ButtonProps> = ({
  label, onPress, variant = 'primary', size = 'md',
  isLoading, disabled, fullWidth, leftIcon, rightIcon, style,
}) => {
  const sz  = sizeMap[size];
  const off = disabled || isLoading;

  const labelColor =
    variant === 'primary'   ? Colors.white :
    variant === 'secondary' ? Colors.p800  :
    variant === 'ghost'     ? Colors.p500  :
    Colors.error;

  const content = (
    <View style={[styles.inner, { paddingHorizontal: sz.px }]}>
      {isLoading
        ? <ActivityIndicator color={labelColor} size="small" />
        : <>
            {leftIcon}
            <Text style={[styles.label, { fontSize: sz.fontSize, color: labelColor }]}>
              {label}
            </Text>
            {rightIcon}
          </>
      }
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={off}
        activeOpacity={0.85}
        style={[fullWidth && styles.full, off && styles.disabled, style]}
      >
        <LinearGradient
          colors={Gradients.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { borderRadius: Radius.full, height: sz.height }]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={off}
      activeOpacity={0.75}
      style={[
        styles.base,
        { height: sz.height, borderRadius: Radius.full },
        variant === 'secondary' && styles.secondary,
        variant === 'ghost'     && styles.ghost,
        variant === 'danger'    && styles.danger,
        fullWidth               && styles.full,
        off                     && styles.disabled,
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base:      { justifyContent: 'center', alignItems: 'center' },
  full:      { width: '100%' },
  disabled:  { opacity: 0.48 },
  gradient:  { justifyContent: 'center', alignItems: 'center' },
  inner:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  label:     { fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3 },
  secondary: { borderWidth: 1.5, borderColor: Colors.p800, backgroundColor: 'transparent' },
  ghost:     { backgroundColor: 'transparent' },
  danger:    { borderWidth: 1.5, borderColor: Colors.error, backgroundColor: 'transparent' },
});
