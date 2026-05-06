import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '♪',
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
    {description && <Text style={styles.description}>{description}</Text>}
    {actionLabel && onAction && (
      <Button
        label={actionLabel}
        onPress={onAction}
        variant="primary"
        size="md"
        style={styles.button}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  icon: { fontSize: 48, marginBottom: Spacing.sm },
  title: {
    ...Typography.h2,
    color: Colors.ink,
    textAlign: 'center',
  },
  description: {
    ...Typography.body,
    color: Colors.ink50,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: { marginTop: Spacing.md },
});
