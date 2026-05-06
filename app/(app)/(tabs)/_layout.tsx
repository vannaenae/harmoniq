import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';

type TabIconProps = {
  focused: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
};

function TabIcon({ focused, iconName, label }: TabIconProps) {
  const color = focused ? Colors.p900 : '#9e9aa7';
  return (
    <View style={styles.tabItem}>
      <Ionicons name={iconName} size={22} color={color} />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 10,
          position: 'absolute',
          shadowColor: Colors.p900,
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.10,
          shadowRadius: 20,
          elevation: 20,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.p900,
        tabBarInactiveTintColor: '#9e9aa7',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} iconName="home-outline" label="HOME" />
          ),
        }}
      />
      <Tabs.Screen
        name="setlists"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} iconName="musical-notes-outline" label="SET LISTS" />
          ),
        }}
      />
      <Tabs.Screen
        name="availability"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} iconName="calendar-outline" label="AVAILABILITY" />
          ),
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} iconName="people-outline" label="MEMBERS" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 4,
  },
  tabLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 0.8,
    color: '#9e9aa7',
  },
  tabLabelActive: {
    color: Colors.p900,
  },
});
