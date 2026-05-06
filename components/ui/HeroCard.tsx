import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Radius, Shadow, Spacing } from '../../constants/spacing';

interface HeroCardProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  stats?: Array<{ label: string; value: string | number }>;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  eyebrow, title, subtitle, badge, stats, children, style,
}) => (
  <LinearGradient
    colors={Gradients.hero}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[styles.container, Shadow.purple, style]}
  >
    <View style={styles.header}>
      {eyebrow && (
        <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
      )}
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge.toUpperCase()}</Text>
        </View>
      )}
    </View>

    <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

    {children}

    {stats && stats.length > 0 && (
      <View style={styles.statsRow}>
        {stats.map((s, i) => (
          <View key={i} style={styles.statItem}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label.toUpperCase()}</Text>
          </View>
        ))}
      </View>
    )}
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  eyebrow: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.5,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: {
    ...Typography.micro,
    color: Colors.white,
    letterSpacing: 0.8,
  },
  title: {
    ...Typography.headlineXL,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyLG,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginTop: Spacing.lg,
    paddingTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: { flexDirection: 'column' },
  statValue: {
    ...Typography.headlineLG,
    color: Colors.white,
  },
  statLabel: {
    ...Typography.micro,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1,
  },
});
