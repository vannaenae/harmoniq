import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

// Maps symbol names to emoji equivalents for cross-platform support
const symbolMap: Record<string, string> = {
  home:            '⌂',
  queue_music:     '♫',
  event_available: '◻',
  group:           '◎',
};

// Better emoji set
const emojiMap: Record<string, { inactive: string; active: string }> = {
  home:            { inactive: '🏠', active: '🏠' },
  queue_music:     { inactive: '📋', active: '📋' },
  event_available: { inactive: '📅', active: '📅' },
  group:           { inactive: '👥', active: '👥' },
};

interface TabBarIconProps {
  symbol: keyof typeof emojiMap;
  focused: boolean;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({ symbol, focused }) => {
  const emoji = emojiMap[symbol] ?? { inactive: '●', active: '●' };

  return (
    <View style={[styles.wrapper, focused && styles.wrapperActive]}>
      <Text style={styles.emoji}>{emoji.inactive}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapperActive: {
    backgroundColor: Colors.p50,
  },
  emoji: {
    fontSize: 22,
  },
});
