import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';

type TabIconProps = { focused: boolean; icon: string; label: string };

function TabIcon({ focused, icon, label }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabIconText, focused && styles.tabIconActive]}>{icon}</Text>
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
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="⊙" label="HOME" />,
        }}
      />
      <Tabs.Screen
        name="setlists"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="♪" label="SET LISTS" />,
        }}
      />
      <Tabs.Screen
        name="availability"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="📅" label="AVAILABILITY" />,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="👥" label="MEMBERS" />,
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
  tabIconText: {
    fontSize: 20,
    color: '#9e9aa7',
  },
  tabIconActive: {
    color: Colors.p900,
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
