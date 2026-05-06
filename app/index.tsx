import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { Colors, Gradients } from '../constants/colors';
import { Typography } from '../constants/typography';

export default function SplashGate() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;
    const timer = setTimeout(() => {
      if (user) {
        router.replace(user.choirId ? '/(app)/(tabs)' : '/(app)/onboarding');
      } else {
        router.replace('/(auth)/login');
      }
    }, 1800);
    return () => clearTimeout(timer);
  }, [isInitialized, user]);

  return (
    <LinearGradient colors={Gradients.splash} style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoIcon}>♪</Text>
          <Text style={styles.logo}>Harmoniq</Text>
          <Text style={styles.tagline}>Worship. Coordinated.</Text>
        </View>
        <Text style={styles.brand}>by SoulSPCE</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoWrap: { alignItems: 'center', gap: 12 },
  logoIcon: { fontSize: 56, color: Colors.white },
  logo: {
    ...Typography.display,
    color: Colors.white,
    fontStyle: 'italic',
    letterSpacing: -1.5,
  },
  tagline: {
    ...Typography.bodyMed,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  brand: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.5)',
    position: 'absolute',
    bottom: 40,
    letterSpacing: 1.5,
  },
});
