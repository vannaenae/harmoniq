import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';

/** H-with-waveform logo built from SVG paths */
function HarmoniqIcon() {
  return (
    <Svg width={140} height={100} viewBox="0 0 140 100">
      <Defs>
        <SvgGradient id="logoGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#D8B4FE" stopOpacity="1" />
          <Stop offset="1" stopColor="#7C3AED" stopOpacity="1" />
        </SvgGradient>
      </Defs>

      {/* Left waveform bars */}
      <Path d="M8 34 L8 66"   stroke="#C084FC" strokeWidth="6" strokeLinecap="round" />
      <Path d="M20 20 L20 80" stroke="#A855F7" strokeWidth="6" strokeLinecap="round" />

      {/* H left pillar */}
      <Path d="M34 10 L34 90" stroke="#9333EA" strokeWidth="10" strokeLinecap="round" />

      {/* H crossbar — wave dips down then up */}
      <Path
        d="M34 50 Q52 72 70 50 Q88 28 106 50"
        stroke="#9333EA"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* H right pillar */}
      <Path d="M106 10 L106 90" stroke="#9333EA" strokeWidth="10" strokeLinecap="round" />

      {/* Right waveform bars */}
      <Path d="M120 20 L120 80" stroke="#A855F7" strokeWidth="6" strokeLinecap="round" />
      <Path d="M132 34 L132 66" stroke="#C084FC" strokeWidth="6" strokeLinecap="round" />
    </Svg>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 800, delay: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, delay: 150, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.bg}>
      {/* Purple radial glow behind logo */}
      <View style={styles.glowTop} />

      {/* Flowing wave shape in the middle */}
      <View style={styles.waveWrap}>
        <LinearGradient
          colors={['transparent', 'rgba(120,50,230,0.18)', 'rgba(160,80,255,0.12)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.wave1}
        />
        <LinearGradient
          colors={['transparent', 'rgba(140,60,240,0.10)', 'rgba(100,40,200,0.08)', 'transparent']}
          start={{ x: 0.1, y: 0.5 }}
          end={{ x: 0.9, y: 0.5 }}
          style={styles.wave2}
        />
      </View>

      <SafeAreaView style={styles.inner}>
        {/* Logo + name + tagline */}
        <Animated.View style={[styles.logoArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <HarmoniqIcon />
          <Text style={styles.wordmark}>Harmoniq</Text>
          <Text style={styles.tagline}>Sacred Coordination.</Text>
        </Animated.View>

        <View style={{ flex: 1 }} />

        {/* Buttons */}
        <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
          {/* Sign In — glass/outlined */}
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>

          {/* Create Account — WHITE (style guide) */}
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.85}
          >
            <Text style={styles.createText}>Create Account  →</Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footerBrand}>A SOULSPCE PRODUCT</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#0A0520',
  },

  glowTop: {
    position: 'absolute',
    top: -80,
    left: '50%',
    marginLeft: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(110,40,220,0.35)',
    // Soft blur effect via shadow
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 120,
    elevation: 0,
  },

  waveWrap: {
    position: 'absolute',
    top: '42%',
    left: 0,
    right: 0,
    height: 180,
    overflow: 'hidden',
  },
  wave1: {
    position: 'absolute',
    top: 20,
    left: -40,
    right: -40,
    height: 60,
    borderRadius: 30,
    transform: [{ rotate: '-8deg' }, { scaleX: 1.3 }],
  },
  wave2: {
    position: 'absolute',
    top: 70,
    left: -20,
    right: -20,
    height: 50,
    borderRadius: 25,
    transform: [{ rotate: '6deg' }, { scaleX: 1.2 }],
  },

  inner: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoArea: {
    alignItems: 'center',
    gap: 14,
    marginTop: 40,
  },

  wordmark: {
    fontFamily: 'Inter_700Bold',
    fontSize: 48,
    letterSpacing: -1.5,
    color: Colors.white,
    marginTop: -4,
  },

  tagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },

  actions: {
    width: '100%',
    gap: Spacing.sm,
    alignItems: 'center',
  },

  signInBtn: {
    width: '100%',
    height: 56,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  signInText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.white,
  },

  // WHITE — matches style guide primary button
  createBtn: {
    width: '100%',
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  createText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.p900,
  },

  footerBrand: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 2.5,
    color: 'rgba(255,255,255,0.25)',
    textTransform: 'uppercase',
    marginTop: Spacing.sm,
  },
});
