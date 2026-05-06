import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Radius } from '../../constants/spacing';

interface SkeletonCardProps {
  height?: number;
  style?: ViewStyle;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  height = 120,
  style,
  lines = 0,
}) => {
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { height, opacity: anim }, style]}>
      {lines > 0 && (
        <View style={styles.lines}>
          {Array.from({ length: lines }).map((_, i) => (
            <View
              key={i}
              style={[styles.line, { width: i === 0 ? '70%' : '45%' }]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    padding: 16,
  },
  lines: { gap: 10 },
  line: {
    height: 12,
    backgroundColor: Colors.surfaceHighest,
    borderRadius: Radius.sm,
  },
});
