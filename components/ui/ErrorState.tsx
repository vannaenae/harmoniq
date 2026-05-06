import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = "We couldn't load this content. Check your connection and try again.",
  onRetry,
  fullScreen = false,
}) => (
  <View style={[styles.container, fullScreen && styles.fullScreen]}>
    <Text style={styles.icon}>⚠️</Text>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {onRetry && (
      <Button label="Try again" onPress={onRetry} variant="secondary" size="sm" style={styles.btn} />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.surfaceBg,
  },
  icon: { fontSize: 48 },
  title: { ...Typography.h2, color: Colors.ink, textAlign: 'center' },
  message: {
    ...Typography.body,
    color: Colors.ink50,
    textAlign: 'center',
    lineHeight: 22,
  },
  btn: { marginTop: Spacing.sm },
});
