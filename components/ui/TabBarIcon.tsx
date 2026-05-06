import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface TabBarIconProps {
  iconName: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({ iconName, focused }) => (
  <View style={[styles.wrapper, focused && styles.wrapperActive]}>
    <Ionicons name={iconName} size={22} color={focused ? Colors.p900 : '#9e9aa7'} />
  </View>
);

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
});
