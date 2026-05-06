import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerUser } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Button, Input } from '../../components/ui';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';
import { UserRole } from '../../types';

const roles: Array<{ value: UserRole; label: string; icon: string; desc: string }> = [
  { value: 'leader', label: 'Worship Leader', icon: '🎵', desc: 'Direct & manage the choir' },
  { value: 'member', label: 'Choir Member', icon: '🎶', desc: 'Sing & prepare with your team' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const user = await registerUser(email.trim(), password, name.trim(), role);
      setUser(user);
      router.replace('/(app)/onboarding');
    } catch (e: any) {
      const msg = e?.code === 'auth/email-already-in-use'
        ? 'This email is already registered.'
        : 'Failed to create account. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>Harmoniq</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>Join the ensemble</Text>
              <Text style={styles.sub}>Create an account to coordinate worship.</Text>
            </View>

            {/* Role Picker */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>I am joining as a</Text>
              <View style={styles.roleRow}>
                {roles.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => setRole(r.value)}
                    style={[styles.roleCard, role === r.value && styles.roleCardActive]}
                  >
                    <Text style={styles.roleIcon}>{r.icon}</Text>
                    <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>
                      {r.label}
                    </Text>
                    <Text style={styles.roleDesc}>{r.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

            <View style={styles.fields}>
              <Input
                label="Full name"
                placeholder="Your name"
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
              />
              <Input
                label="Email address"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <Input
                label="Password"
                placeholder="Min. 8 characters"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                rightIcon={
                  <Text style={styles.toggle}>{showPassword ? 'Hide' : 'Show'}</Text>
                }
                onRightIconPress={() => setShowPassword((p) => !p)}
              />
            </View>

            <Button
              label="Create Account"
              onPress={handleRegister}
              isLoading={isLoading}
              fullWidth
              size="lg"
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.footerLink}>Sign in</Text>
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
  logo: { ...Typography.h1, color: Colors.p900, fontStyle: 'italic', letterSpacing: -0.5 },
  form: { flex: 1, paddingTop: Spacing.xl, gap: Spacing.xl },
  titleBlock: { gap: Spacing.xs },
  title: { ...Typography.headlineLG, color: Colors.ink },
  sub: { ...Typography.bodyMD, color: Colors.ink50 },
  section: { gap: Spacing.sm },
  sectionLabel: { ...Typography.label, color: Colors.ink70 },
  roleRow: { flexDirection: 'row', gap: Spacing.sm },
  roleCard: {
    flex: 1,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.ink10,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    gap: 4,
  },
  roleCardActive: {
    borderColor: Colors.p800,
    backgroundColor: Colors.p50,
  },
  roleIcon: { fontSize: 24 },
  roleLabel: { ...Typography.labelMD, color: Colors.ink, textAlign: 'center' },
  roleLabelActive: { color: Colors.p800 },
  roleDesc: { ...Typography.label, color: Colors.ink50, textAlign: 'center' },
  errorBanner: {
    ...Typography.bodyMed,
    color: Colors.error,
    backgroundColor: Colors.errorBg,
    padding: Spacing.md,
    borderRadius: 12,
  },
  fields: { gap: Spacing.base },
  toggle: { ...Typography.label, color: Colors.p600 },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: Spacing.xl },
  footerText: { ...Typography.body, color: Colors.ink50 },
  footerLink: { ...Typography.bodyMed, color: Colors.p800 },
});
