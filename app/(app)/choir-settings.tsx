import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  Alert, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { logoutUser } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useChoirStore } from '../../store/choirStore';
import { Button, Card, Input, ScreenHeader } from '../../components/ui';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing, Radius } from '../../constants/spacing';

export default function ChoirSettingsScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { choir, setChoir } = useChoirStore();

  const [choirName, setChoirName]     = useState(choir?.name ?? '');
  const [churchName, setChurchName]   = useState(choir?.churchName ?? '');
  const [serviceDay, setServiceDay]   = useState(choir?.defaultServiceDay ?? '');
  const [isSaving, setIsSaving]       = useState(false);
  const [error, setError]             = useState('');

  // Profile
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  const isOwner = user?.role === 'owner';

  const handleSaveChoir = async () => {
    if (!choir?.id || !isOwner) return;
    if (!choirName.trim()) { setError('Choir name is required.'); return; }
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'choirs', choir.id), {
        name: choirName.trim(),
        churchName: churchName.trim() || null,
        defaultServiceDay: serviceDay.trim() || null,
        updatedAt: serverTimestamp(),
      });
      setChoir({ ...choir, name: choirName.trim(), churchName: churchName.trim() || undefined, defaultServiceDay: serviceDay.trim() || undefined });
      setError('');
    } catch { setError('Failed to update choir settings.'); }
    finally { setIsSaving(false); }
  };

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    if (!displayName.trim()) return;
    setSavingProfile(true);
    await updateDoc(doc(db, 'users', user.uid), { displayName: displayName.trim(), updatedAt: serverTimestamp() });
    setUser({ ...user, displayName: displayName.trim() });
    setSavingProfile(false);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await logoutUser();
          setUser(null);
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Settings" showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Profile */}
          <Text style={styles.groupLabel}>YOUR PROFILE</Text>
          <Card style={styles.card}>
            <Input label="Display name" value={displayName} onChangeText={setDisplayName} />
            <Text style={styles.emailText}>{user?.email}</Text>
            <Button label={savingProfile ? 'Saving...' : 'Save Profile'} onPress={handleSaveProfile} isLoading={savingProfile} size="sm" />
          </Card>

          {/* Choir Settings (owner only) */}
          {isOwner && choir && (
            <>
              <Text style={styles.groupLabel}>CHOIR SETTINGS</Text>
              <Card style={styles.card}>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Input label="Choir name" value={choirName} onChangeText={setChoirName} />
                <Input label="Church / organisation" value={churchName} onChangeText={setChurchName} />
                <Input label="Default service day" value={serviceDay} onChangeText={setServiceDay} />
                <Button label={isSaving ? 'Saving...' : 'Save Choir Settings'} onPress={handleSaveChoir} isLoading={isSaving} size="sm" />
              </Card>
            </>
          )}

          {/* Invite code */}
          {choir && (
            <>
              <Text style={styles.groupLabel}>INVITE</Text>
              <Card style={styles.card}>
                <Text style={styles.inviteLabel}>Choir Invite Code</Text>
                <Text style={styles.inviteCode}>{choir.inviteCode}</Text>
                <Button
                  label="Manage Invites"
                  onPress={() => router.push('/(app)/invite')}
                  variant="secondary"
                  size="sm"
                />
              </Card>
            </>
          )}

          {/* Danger zone */}
          <Text style={styles.groupLabel}>ACCOUNT</Text>
          <Card style={styles.card}>
            <TouchableOpacity onPress={handleLogout} style={styles.dangerRow}>
              <Text style={styles.dangerText}>Sign Out</Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: 32 },
  groupLabel: {
    ...Typography.caption, color: Colors.ink50, letterSpacing: 1.5, marginTop: Spacing.base,
  },
  card: { gap: Spacing.base },
  emailText: { ...Typography.label, color: Colors.ink50 },
  error: {
    ...Typography.bodyMed, color: Colors.error,
    backgroundColor: Colors.errorBg, padding: Spacing.md, borderRadius: 12,
  },
  inviteLabel: { ...Typography.label, color: Colors.ink50 },
  inviteCode: {
    fontFamily: 'Inter_700Bold', fontSize: 28, color: Colors.p900, letterSpacing: 4,
  },
  dangerRow: { paddingVertical: Spacing.sm },
  dangerText: { ...Typography.bodyMed, color: Colors.error },
});
