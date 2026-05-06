import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginUser, fetchUserDoc } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState('');

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
      router.replace(user?.choirId ? '/(app)/(tabs)' : '/(app)/onboarding');
    } catch (e: any) {
      setError(
        e?.code === 'auth/invalid-credential'
          ? 'Incorrect email or password.'
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Welcome back</Text>

          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

          <View style={styles.fields}>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={Colors.ink30}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.fieldWrap}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>PASSWORD</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                  <Text style={styles.forgotLink}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.ink30}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity style={styles.showBtn} onPress={() => setShowPassword(p => !p)}>
                  <Text style={styles.showText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Button label="Sign In" onPress={handleLogin} isLoading={isLoading} fullWidth size="lg" style={styles.cta} />
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{"Don't have an account? "}</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Create one</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.surfaceBg },
  back:       { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  backIcon:   { fontSize: 24, color: Colors.ink },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: 40,
  },

  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.6,
    color: Colors.p900,
    marginBottom: 40,
  },

  errorBanner: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.error,
    backgroundColor: Colors.errorBg,
    padding: Spacing.base,
    borderRadius: 10,
    marginBottom: Spacing.lg,
  },

  fields:    { gap: Spacing.xl },
  fieldWrap: { gap: 6 },
  labelRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

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
    paddingRight: 52,
    backgroundColor: 'transparent',
  },

  showBtn:    { position: 'absolute', right: 0, bottom: Spacing.sm },
  showText:   { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.p500 },
  forgotLink: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.p500 },
  cta:        { marginTop: 40 },

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
