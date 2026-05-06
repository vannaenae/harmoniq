import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';

export default function WelcomeScreen() {
  const router = useRouter();

  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, delay: 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, delay: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#18005F', '#3D0080', '#560056']}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.inner}>
        {/* Logo */}
        <Animated.View style={[styles.logoArea, { opacity: fadeAnim }]}>
          <Text style={styles.logoSymbol}>♪</Text>
          <Text style={styles.logoText}>Harmoniq</Text>
        </Animated.View>

        {/* Hero content */}
        <Animated.View style={[styles.heroArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.tagWrap}>
            <Text style={styles.tag}>WORSHIP. COORDINATED.</Text>
          </View>
          <Text style={styles.headline}>Sacred{'\n'}Coordination.</Text>
          <Text style={styles.sub}>
            Elevate your ministry with a platform designed for the reverence of worship and the precision of professional music leadership.
          </Text>
        </Animated.View>

        {/* CTAs */}
        <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
          {/* Sign In — outlined */}
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>

          {/* Create Account — solid white */}
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.85}
          >
            <Text style={styles.createText}>Create Account  →</Text>
          </TouchableOpacity>

          <Text style={styles.brand}>A SOULSPCE PRODUCT</Text>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    justifyContent: 'space-between',
  },

  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoSymbol: {
    fontSize: 22,
    color: Colors.white,
  },
  logoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    fontStyle: 'italic',
    letterSpacing: -0.5,
    color: Colors.white,
  },

  heroArea: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.lg,
  },
  tagWrap: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tag: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: 'Inter_700Bold',
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -1.5,
    color: Colors.white,
  },
  sub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.65)',
    maxWidth: 320,
  },

  actions: {
    gap: Spacing.sm,
    alignItems: 'center',
  },

  signInBtn: {
    width: '100%',
    height: 54,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.white,
  },

  createBtn: {
    width: '100%',
    height: 54,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.p900,
  },

  brand: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 2.5,
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    marginTop: Spacing.sm,
  },
});
