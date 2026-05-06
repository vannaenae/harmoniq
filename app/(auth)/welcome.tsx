import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Path, Rect, Defs,
  LinearGradient as SvgGradient, Stop,
  Filter, FeGaussianBlur, FeColorMatrix, FeBlend,
} from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';

/** Official Harmoniq icon — exact SVG from brand assets */
function HarmoniqIcon() {
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120" fill="none">
      <Defs>
        <SvgGradient id="harmoniqGradient" x1="25" y1="20" x2="95" y2="100" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#F5B6FF" />
          <Stop offset="0.48" stopColor="#9B4DFF" />
          <Stop offset="1" stopColor="#5A18D6" />
        </SvgGradient>
        <Filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <FeGaussianBlur stdDeviation={3} result="blur" />
          <FeColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0.65  0 0 0 0 0.20  0 0 0 0 1  0 0 0 0.65 0"
          />
          <FeBlend in="SourceGraphic" />
        </Filter>
      </Defs>

      {/* Left synth bars */}
      <Rect x={15} y={51} width={5}  height={18} rx={2.5} fill="url(#harmoniqGradient)" opacity={0.75} />
      <Rect x={25} y={43} width={6}  height={34} rx={3}   fill="url(#harmoniqGradient)" opacity={0.85} />
      <Rect x={37} y={34} width={7}  height={52} rx={3.5} fill="url(#harmoniqGradient)" />

      {/* Main H shape */}
      <Path
        d="M48 24C48 19.6 51.6 16 56 16C60.4 16 64 19.6 64 24V47.5C67.5 43.8 71.2 42 75 42C82.2 42 86.7 49 90 54V24C90 19.6 93.6 16 98 16C102.4 16 106 19.6 106 24V96C106 100.4 102.4 104 98 104C93.6 104 90 100.4 90 96V72.5C86.5 76.2 82.8 78 79 78C71.8 78 67.3 71 64 66V96C64 100.4 60.4 104 56 104C51.6 104 48 100.4 48 96V24Z"
        fill="url(#harmoniqGradient)"
        filter="url(#glow)"
      />

      {/* Right synth bars */}
      <Rect x={111} y={51} width={5} height={18} rx={2.5} fill="url(#harmoniqGradient)" opacity={0.75} />
      <Rect x={100} y={43} width={6} height={34} rx={3}   fill="url(#harmoniqGradient)" opacity={0.85} />
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
