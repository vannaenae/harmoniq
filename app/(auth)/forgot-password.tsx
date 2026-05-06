import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resetPassword } from '../../services/authService';
import { Button } from '../../components/ui';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);

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
      {/* Header with close X */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Harmoniq</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.ink} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {sent ? (
            <View style={styles.successBlock}>
              <View style={styles.iconWrap}>
                <Ionicons name="mail-outline" size={40} color={Colors.p800} />
              </View>
              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.sub}>
                {"We've sent a password reset link to "}
                <Text style={{ fontWeight: '600', color: Colors.p800 }}>{email}</Text>
                {'.'}
              </Text>
              <Button label="Back to Sign In" onPress={() => router.replace('/(auth)/login')} fullWidth size="lg" />
            </View>
          ) : (
            <View style={styles.form}>
              {/* Lock icon */}
              <View style={styles.iconWrap}>
                <Ionicons name="lock-open-outline" size={40} color={Colors.p800} />
              </View>

              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.sub}>
                Enter your email address and we'll send you instructions to reset your password.
              </Text>

              {error ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Email field */}
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.ink30}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <Button
                label="Send Reset Link"
                onPress={handleReset}
                isLoading={isLoading}
                fullWidth
                size="lg"
              />

              <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={16} color={Colors.p500} />
                <Text style={styles.backText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
  },
  headerTitle: {
    fontFamily: 'Inter_900Black',
    fontSize: 20,
    fontStyle: 'italic',
    letterSpacing: -0.8,
    color: Colors.p900,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceMid,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: 40,
  },

  form: { gap: Spacing.xl },

  iconWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: Colors.p50,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-start',
  },

  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    letterSpacing: -0.8,
    color: Colors.ink,
    lineHeight: 38,
    marginTop: -Spacing.sm,
  },
  sub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.ink70,
    lineHeight: 22,
    marginTop: -Spacing.base,
  },

  errorBanner: {
    backgroundColor: Colors.errorBg,
    borderRadius: 12,
    padding: Spacing.base,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.error,
  },

  fieldWrap: { gap: 8 },
  fieldLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.ink50,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    color: Colors.ink,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.ink10,
    paddingVertical: Spacing.sm,
    backgroundColor: 'transparent',
  },

  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: Spacing.sm,
  },
  backText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.p500,
  },

  successBlock: {
    gap: Spacing.xl,
    paddingTop: Spacing.xl,
    alignItems: 'flex-start',
  },
});
