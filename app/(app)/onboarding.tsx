import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { createChoir, joinChoirByCode } from '../../services/choirService';
import { useAuthStore } from '../../store/authStore';
import { useChoirStore } from '../../store/choirStore';
import { Button, Input } from '../../components/ui';
import { Colors, Gradients } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';

type Step = 'choose' | 'create' | 'join';

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setChoir } = useChoirStore();

  const [step, setStep] = useState<Step>('choose');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Create form
  const [choirName, setChoirName] = useState('');
  const [churchName, setChurchName] = useState('');
  const [serviceDay, setServiceDay] = useState('Sunday');

  // Join form
  const [inviteCode, setInviteCode] = useState('');

  const handleCreate = async () => {
    if (!choirName.trim()) { setError('Please enter a choir name.'); return; }
    if (!user?.uid) return;
    setIsLoading(true);
    setError('');
    try {
      const choir = await createChoir(user.uid, choirName.trim(), churchName.trim() || undefined, serviceDay);
      setChoir(choir);
      router.replace('/(app)/(tabs)');
    } catch {
      setError('Failed to create choir. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (inviteCode.trim().length < 6) { setError('Enter a valid 6-character invite code.'); return; }
    if (!user?.uid) return;
    setIsLoading(true);
    setError('');
    try {
      const choir = await joinChoirByCode(user.uid, inviteCode.trim());
      setChoir(choir);
      router.replace('/(app)/(tabs)');
    } catch {
      setError('Invalid code. Check with your choir admin and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#18005F', '#2D0070']} style={styles.topBar}>
        <Text style={styles.logo}>Harmoniq</Text>
        {step !== 'choose' && (
          <TouchableOpacity onPress={() => { setStep('choose'); setError(''); }} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.8)" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {step === 'choose' && (
            <View style={styles.section}>
              <Text style={styles.greeting}>
                Welcome, {user?.displayName?.split(' ')[0] ?? 'there'}
              </Text>
              <Text style={styles.sub}>
                Get started by creating a new choir or joining an existing one.
              </Text>

              <TouchableOpacity style={styles.optionCard} onPress={() => setStep('create')}>
                <View style={styles.optionIconWrap}>
                  <Ionicons name="musical-notes-outline" size={26} color={Colors.p700} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Create a choir</Text>
                  <Text style={styles.optionDesc}>Set up your worship team workspace</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.ink30} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionCard} onPress={() => setStep('join')}>
                <View style={styles.optionIconWrap}>
                  <Ionicons name="key-outline" size={26} color={Colors.p700} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Join a choir</Text>
                  <Text style={styles.optionDesc}>Enter an invite code from your director</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.ink30} />
              </TouchableOpacity>
            </View>
          )}

          {step === 'create' && (
            <View style={styles.section}>
              <Text style={styles.stepTitle}>Create your choir</Text>
              <Text style={styles.sub}>Set up your worship team's home base.</Text>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <View style={styles.fields}>
                <Input
                  label="Choir name *"
                  placeholder="e.g. Grace Worship Choir"
                  value={choirName}
                  onChangeText={setChoirName}
                />
                <Input
                  label="Church / organisation name"
                  placeholder="e.g. Grace Community Church"
                  value={churchName}
                  onChangeText={setChurchName}
                />
                <Input
                  label="Default service day"
                  placeholder="e.g. Sunday"
                  value={serviceDay}
                  onChangeText={setServiceDay}
                />
              </View>

              <Button
                label={isLoading ? 'Creating...' : 'Create Choir'}
                onPress={handleCreate}
                isLoading={isLoading}
                fullWidth
                size="lg"
              />
            </View>
          )}

          {step === 'join' && (
            <View style={styles.section}>
              <Text style={styles.stepTitle}>Join a choir</Text>
              <Text style={styles.sub}>Enter the 6-character invite code from your director.</Text>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Input
                label="Invite code"
                placeholder="e.g. A1B2C3"
                autoCapitalize="characters"
                maxLength={6}
                value={inviteCode}
                onChangeText={setInviteCode}
              />

              <Button
                label={isLoading ? 'Joining...' : 'Join Choir'}
                onPress={handleJoin}
                isLoading={isLoading}
                fullWidth
                size="lg"
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
  topBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { ...Typography.h2, color: Colors.white, fontStyle: 'italic' },
  backBtn: { position: 'absolute', left: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { ...Typography.bodyMed, color: 'rgba(255,255,255,0.8)' },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  section: { gap: Spacing.xl, paddingBottom: Spacing.xxl },
  greeting: { ...Typography.headlineXL, color: Colors.ink },
  stepTitle: { ...Typography.headlineLG, color: Colors.ink },
  sub: { ...Typography.bodyMD, color: Colors.ink50 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.ink10,
    gap: Spacing.base,
  },
  optionIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.p50,
    alignItems: 'center', justifyContent: 'center',
  },
  optionText: { flex: 1 },
  optionTitle: { ...Typography.h3, color: Colors.ink },
  optionDesc: { ...Typography.body, color: Colors.ink50 },
  fields: { gap: Spacing.base },
  error: {
    ...Typography.bodyMed,
    color: Colors.error,
    backgroundColor: Colors.errorBg,
    padding: Spacing.md,
    borderRadius: 12,
  },
});
