import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resetPassword } from '../../services/authService';
import { Button, Input, ScreenHeader } from '../../components/ui';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) { setError('Please enter your email.'); return; }
    setIsLoading(true);
    setError('');
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch {
      setError('Unable to send reset email. Check the address and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Reset password" showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {sent ? (
            <View style={styles.successBlock}>
              <Ionicons name="mail-outline" size={56} color={Colors.p700} />
              <Text style={styles.successTitle}>Check your email</Text>
              <Text style={styles.successSub}>
                We've sent a password reset link to{' '}
                <Text style={{ fontWeight: '600', color: Colors.p800 }}>{email}</Text>.
              </Text>
              <Button label="Back to sign in" onPress={() => router.replace('/(auth)/login')} fullWidth />
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.sub}>
                Enter your registered email and we'll send you a link to reset your password.
              </Text>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Input
                label="Email address"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Button
                label="Send reset link"
                onPress={handleReset}
                isLoading={isLoading}
                fullWidth
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, gap: Spacing.xl },
  form: { gap: Spacing.xl },
  sub: { ...Typography.bodyMD, color: Colors.ink50 },
  error: {
    ...Typography.bodyMed,
    color: Colors.error,
    backgroundColor: Colors.errorBg,
    padding: Spacing.md,
    borderRadius: 12,
  },
  successBlock: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    gap: Spacing.base,
  },
  successTitle: { ...Typography.h1, color: Colors.ink },
  successSub: { ...Typography.bodyMD, color: Colors.ink50, textAlign: 'center', lineHeight: 24 },
});
