import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/colors';

export default function SplashGate() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in logo
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Animate dots
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotsAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dotsAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    const timer = setTimeout(() => {
      if (user) {
        router.replace(user.choirId ? '/(app)/(tabs)' : '/(app)/onboarding');
      } else {
        router.replace('/(auth)/welcome');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isInitialized, user]);

  return (
    <LinearGradient
      colors={['#18005F', '#3D0080', '#560056']}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.inner}>
        <Animated.View style={[styles.center, { opacity: fadeAnim }]}>
          <Text style={styles.logo}>Harmoniq</Text>
          <Animated.Text style={[styles.dots, { opacity: dotsAnim }]}>• • •</Animated.Text>
        </Animated.View>

        <Text style={styles.brand}>A SOULSPCE PRODUCT</Text>
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
  },
  center: { alignItems: 'center', gap: 20 },
  logo: {
    fontFamily: 'Inter_700Bold',
    fontSize: 40,
    color: Colors.white,
    letterSpacing: -1,
  },
  dots: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 6,
  },
  brand: {
    position: 'absolute',
    bottom: 48,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 2.5,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
  },
});
