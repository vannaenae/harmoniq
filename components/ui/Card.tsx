import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Radius, Shadow, Spacing } from '../../constants/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'flat';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = Spacing.lg,
}) => (
  <View
    style={[
      styles.base,
      variant === 'elevated' && Shadow.md,
      variant === 'flat' && styles.flat,
      { padding },
      style,
    ]}
  >
    {children}
  </View>
);

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.ink10,
  },
  flat: {
    borderWidth: 0,
    backgroundColor: Colors.surfaceMid,
  },
});
