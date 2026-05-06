import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerUser } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';

type Role = 'owner' | 'member';

const ROLES: { key: Role; icon: string; label: string }[] = [
  { key: 'owner',          icon: '♩', label: 'Worship Leader'  },
  { key: 'member',         icon: '👥', label: 'Choir Member'    },
  { key: 'member' as Role, icon: '🎹', label: 'Instrumentalist' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [role, setRole]           = useState<Role>('owner');
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
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
        ? 'An account with this email already exists.'
        : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Logo */}
          <Text style={styles.logo}>Harmoniq</Text>

          {/* Heading */}
          <Text style={styles.title}>Join the ensemble</Text>
          <Text style={styles.sub}>Create an account to coordinate worship services and setlists.</Text>

          {/* Card */}
          <View style={styles.card}>
            {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

            {/* Role selector */}
            <Text style={styles.roleLabel}>I am joining as a</Text>
            <View style={styles.roleGrid}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.roleCard, role === r.key && styles.roleCardActive]}
                  onPress={() => setRole(r.key)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.roleIcon}>{r.icon}</Text>
                  <Text style={[styles.roleText, role === r.key && styles.roleTextActive]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Fields */}
            <View style={styles.fields}>
              <View style={styles.inputRow}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={Colors.ink30}
                  autoComplete="name"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              <View style={styles.divider} />

              <View style={styles.inputRow}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor={Colors.ink30}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              <View style={styles.divider} />

              <View style={styles.inputRow}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.ink30}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            <Button
              label="Create Account →"
              onPress={handleRegister}
              isLoading={isLoading}
              fullWidth
              size="lg"
              style={styles.cta}
            />

            <Text style={styles.terms}>
              {'By creating an account, you agree to our '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' and '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
              .
            </Text>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: 40,
    alignItems: 'center',
  },

  logo: {
    fontFamily: 'Inter_900Black',
    fontSize: 28,
    fontStyle: 'italic',
    letterSpacing: -1,
    color: Colors.p900,
    marginBottom: Spacing.xl,
  },

  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    letterSpacing: -0.5,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  sub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.ink70,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
  },

  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },

  errorBanner: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.error,
    backgroundColor: Colors.errorBg,
    padding: Spacing.base,
    borderRadius: 10,
  },

  roleLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.ink70,
    marginBottom: Spacing.xs,
  },
  roleGrid: { gap: Spacing.sm },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    padding: Spacing.base,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.ink10,
    backgroundColor: Colors.surface,
  },
  roleCardActive: {
    borderColor: Colors.p900,
    borderWidth: 2,
    backgroundColor: Colors.p50,
  },
  roleIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  roleText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.ink70,
  },
  roleTextActive: { color: Colors.p900 },

  fields: { gap: 0 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  inputIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.ink,
    paddingVertical: Spacing.xs,
    backgroundColor: 'transparent',
  },
  divider: { height: 1, backgroundColor: Colors.ink10 },

  cta: { marginTop: Spacing.sm },

  terms: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.ink50,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: { fontFamily: 'Inter_600SemiBold', color: Colors.p500 },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.ink10,
  },
  footerText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.ink50 },
  footerLink: { fontFamily: 'Inter_700Bold', fontSize: 15, color: Colors.p500 },
});
