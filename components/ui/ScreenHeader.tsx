import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title, subtitle, showBack = false, rightElement, style,
}) => {
  const router = useRouter();
  return (
    <View style={[styles.container, style]}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement && <View style={styles.right}>{rightElement}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ink05,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  backBtn: { padding: Spacing.xs },
  backIcon: { fontSize: 22, color: Colors.p800 },
  title: { ...Typography.h2, color: Colors.p900 },
  subtitle: { ...Typography.label, color: Colors.ink50, marginTop: 2 },
  right: {},
});
