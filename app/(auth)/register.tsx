import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { registerUser } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';

type Role = 'owner' | 'member' | 'instrumentalist';

const ROLES: {
  key: Role;
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
}[] = [
  {
    key: 'owner',
    iconName: 'musical-notes',
    label: 'Worship Leader',
    description: 'Lead and manage',
  },
  {
    key: 'member',
    iconName: 'people-outline',
    label: 'Choir Member',
    description: 'Singer',
  },
  {
    key: 'instrumentalist',
    iconName: 'musical-note-outline',
    label: 'Instrumentalist',
    description: 'Musician',
  },
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
      // Map instrumentalist → member role for Firebase
      const firebaseRole = role === 'instrumentalist' ? 'member' : role;
      const user = await registerUser(email.trim(), password, name.trim(), firebaseRole);
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

            {/* Role selector — 3-column grid */}
            <Text style={styles.roleLabel}>I am joining as a</Text>
            <View style={styles.roleGrid}>
              {ROLES.map(r => {
                const active = role === r.key;
                return (
                  <TouchableOpacity
                    key={r.key}
                    style={[styles.roleCard, active && styles.roleCardActive]}
                    onPress={() => setRole(r.key)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.roleIconWrap, active && styles.roleIconWrapActive]}>
                      <Ionicons
                        name={r.iconName}
                        size={20}
                        color={active ? Colors.p900 : Colors.ink50}
                      />
                    </View>
                    <Text style={[styles.roleText, active && styles.roleTextActive]}>{r.label}</Text>
                    <Text style={styles.roleDesc}>{r.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Fields */}
            <View style={styles.fields}>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={18} color={Colors.ink50} style={styles.inputIcon} />
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
                <Ionicons name="mail-outline" size={18} color={Colors.ink50} style={styles.inputIcon} />
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
                <Ionicons name="lock-closed-outline" size={18} color={Colors.ink50} style={styles.inputIcon} />
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
              label="Create Account"
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

  // 3-column grid
  roleGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  roleCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.ink10,
    backgroundColor: Colors.surface,
    gap: 6,
  },
  roleCardActive: {
    borderColor: Colors.p800,
    borderWidth: 2,
    backgroundColor: Colors.p50,
  },
  roleIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceMid,
    alignItems: 'center', justifyContent: 'center',
  },
  roleIconWrapActive: {
    backgroundColor: 'rgba(26,3,96,0.1)',
  },
  roleText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: Colors.ink70,
    textAlign: 'center',
  },
  roleTextActive: { color: Colors.p900 },
  roleDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: Colors.ink50,
    textAlign: 'center',
  },

  fields: { gap: 0 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  inputIcon: { width: 24, textAlign: 'center' },
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
