import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { getInitials } from '../../lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  photoURL?: string | null;
  size?: AvatarSize;
  style?: ViewStyle;
}

const sizeMap: Record<AvatarSize, { container: number; text: object }> = {
  sm: { container: 32,  text: Typography.label },
  md: { container: 44,  text: Typography.bodyMed },
  lg: { container: 56,  text: Typography.h3 },
  xl: { container: 80,  text: Typography.h1 },
};

// Deterministic color from name
const colors = [Colors.p800, Colors.p600, Colors.p400, '#059669', '#D97706', '#DC2626'];
const getBgColor = (name: string) => colors[name.charCodeAt(0) % colors.length];

export const Avatar: React.FC<AvatarProps> = ({ name, photoURL, size = 'md', style }) => {
  const { container, text } = sizeMap[size];
  return (
    <View
      style={[
        styles.base,
        { width: container, height: container, borderRadius: container / 2, backgroundColor: getBgColor(name) },
        style,
      ]}
    >
      {photoURL ? (
        <Image source={{ uri: photoURL }} style={StyleSheet.absoluteFill} borderRadius={container / 2} />
      ) : (
        <Text style={[text, styles.initials]}>{getInitials(name)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: Colors.white,
    fontWeight: '700',
  },
});
