import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginUser } from '../../services/authService';
import { fetchUserDoc } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Button, Input } from '../../components/ui';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const cred = await loginUser(email.trim(), password);
      const user = await fetchUserDoc(cred.user.uid);
      setUser(user);
      if (user?.choirId) {
        router.replace('/(app)/(tabs)');
      } else {
        router.replace('/(app)/onboarding');
      }
    } catch (e: any) {
      const msg = e?.code === 'auth/invalid-credential'
        ? 'Incorrect email or password.'
        : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>Harmoniq</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.sub}>Sign in to your choir workspace.</Text>
            </View>

            {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

            <View style={styles.fields}>
              <Input
                label="Email address"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
              <Input
                label="Password"
                placeholder="Your password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                rightIcon={
                  <Text style={styles.toggle}>{showPassword ? 'Hide' : 'Show'}</Text>
                }
                onRightIconPress={() => setShowPassword((p) => !p)}
              />
              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                style={styles.forgotWrap}
              >
                <Text style={styles.forgot}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <Button
              label="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
              fullWidth
              size="lg"
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.footerLink}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg },
  header: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceHigh,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  logo: {
    ...Typography.h1,
    color: Colors.p900,
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  form: {
    flex: 1,
    paddingTop: Spacing.xl,
    gap: Spacing.xl,
  },
  titleBlock: { gap: Spacing.xs },
  title: { ...Typography.headlineLG, color: Colors.ink },
  sub: { ...Typography.bodyMD, color: Colors.ink50 },
  errorBanner: {
    ...Typography.bodyMed,
    color: Colors.error,
    backgroundColor: Colors.errorBg,
    padding: Spacing.md,
    borderRadius: 12,
  },
  fields: { gap: Spacing.base },
  forgotWrap: { alignSelf: 'flex-end' },
  forgot: { ...Typography.label, color: Colors.p600 },
  toggle: { ...Typography.label, color: Colors.p600 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Spacing.xl,
  },
  footerText: { ...Typography.body, color: Colors.ink50 },
  footerLink: { ...Typography.bodyMed, color: Colors.p800 },
});
