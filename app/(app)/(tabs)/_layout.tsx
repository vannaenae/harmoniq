import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { TabBarIcon } from '../../../components/ui/TabBarIcon';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 },
        ],
        tabBarActiveTintColor: Colors.p900,
        tabBarInactiveTintColor: Colors.ink50,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon symbol="home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="setlists"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon symbol="queue_music" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="availability"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon symbol="event_available" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon symbol="group" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(24,0,95,0.06)',
    height: 72,
    paddingTop: 8,
    // Purple shadow (iOS)
    shadowColor: '#18005F',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    // Android
    elevation: 12,
    // Rounded top corners
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
  },
});
