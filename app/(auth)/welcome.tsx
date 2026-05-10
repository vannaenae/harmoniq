import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#18005F', '#380038']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.bg}
    >
      <SafeAreaView style={styles.safe}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <Text style={styles.logo}>Harmoniq</Text>
        </View>

        {/* Hero text — vertically centred */}
        <View style={styles.hero}>
          <Text style={styles.headline}>Vocal excellence,{'\n'}coordinated.</Text>
          <Text style={styles.sub}>
            Streamline your choir's schedule, set lists, and availability in one studio-grade platform.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {/* Primary: Get Started */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>

          {/* Secondary: already have account */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg:   { flex: 1 },
  safe: { flex: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },

  logoRow: {
    paddingTop: Spacing.lg,
    alignItems: 'flex-start',
  },
  logo: {
    fontFamily: 'Inter_900Black',
    fontSize: 22,
    fontStyle: 'italic',
    letterSpacing: -0.8,
    color: 'rgba(255,255,255,0.9)',
  },

  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingBottom: 40,
  },
  headline: {
    fontFamily: 'Inter_700Bold',
    fontSize: 42,
    lineHeight: 50,
    letterSpacing: -1.2,
    color: Colors.white,
  },
  sub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.65)',
  },

  actions: {
    gap: Spacing.sm,
  },

  primaryBtn: {
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: Colors.p900,
  },

  secondaryBtn: {
    height: 52,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
});
