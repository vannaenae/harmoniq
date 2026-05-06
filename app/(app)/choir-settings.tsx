import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  Alert, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { logoutUser } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useChoirStore } from '../../store/choirStore';
import { Button, Input, ScreenHeader } from '../../components/ui';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ChoirSettingsScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { choir, setChoir } = useChoirStore();

  const [choirName, setChoirName]   = useState(choir?.name ?? '');
  const [churchName, setChurchName] = useState(choir?.churchName ?? '');
  const [serviceDay, setServiceDay] = useState(choir?.defaultServiceDay ?? 'Sunday');
  const [isSaving, setIsSaving]     = useState(false);
  const [error, setError]           = useState('');

  const [displayName, setDisplayName]     = useState(user?.displayName ?? '');
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
        defaultServiceDay: serviceDay,
        updatedAt: serverTimestamp(),
      });
      setChoir({ ...choir, name: choirName.trim(), churchName: churchName.trim() || undefined, defaultServiceDay: serviceDay });
      setError('');
      Alert.alert('Saved', 'Choir settings updated.');
    } catch { setError('Failed to update choir settings.'); }
    finally { setIsSaving(false); }
  };

  const handleSaveProfile = async () => {
    if (!user?.uid || !displayName.trim()) return;
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

  const handleArchive = () => {
    Alert.alert(
      'Archive Choir',
      'This will remove all members and hide the library. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', style: 'destructive', onPress: () => {} },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Choir Settings" showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Invite code display */}
          {choir && (
            <>
              <Text style={styles.groupLabel}>UNIQUE INVITE CODE</Text>
              <View style={styles.codeCard}>
                <View style={styles.codeRow}>
                  <Text style={styles.inviteCode}>{choir.inviteCode}</Text>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={() => router.push('/(app)/invite')}
                  >
                    <Ionicons name="copy-outline" size={18} color={Colors.p800} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.codeSub}>
                  Share this code with your vocalists to join the roster automatically.
                </Text>
              </View>
            </>
          )}

          {/* Choir settings — owner only */}
          {isOwner && choir && (
            <>
              <Text style={styles.groupLabel}>CHOIR IDENTITY</Text>
              <View style={styles.card}>
                {error ? (
                  <View style={styles.errorWrap}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.inputGroup}>
                  <Input
                    label="Choir Name"
                    value={choirName}
                    onChangeText={setChoirName}
                    rightIcon={<Ionicons name="create-outline" size={16} color={Colors.ink50} />}
                  />
                  <Input
                    label="Church Name"
                    value={churchName}
                    onChangeText={setChurchName}
                    rightIcon={<Ionicons name="business-outline" size={16} color={Colors.ink50} />}
                  />
                </View>

                {/* Service day selector */}
                <View style={styles.daySection}>
                  <Text style={styles.dayLabel}>PRIMARY SERVICE DAY</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
                    {DAYS.map(day => (
                      <TouchableOpacity
                        key={day}
                        style={[styles.dayBtn, serviceDay === day && styles.dayBtnActive]}
                        onPress={() => setServiceDay(day)}
                      >
                        <Text style={[styles.dayBtnText, serviceDay === day && styles.dayBtnTextActive]}>
                          {day.slice(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <Button
                  label={isSaving ? 'Saving…' : 'Update Settings'}
                  onPress={handleSaveChoir}
                  isLoading={isSaving}
                  size="sm"
                />
              </View>
            </>
          )}

          {/* Profile */}
          <Text style={styles.groupLabel}>YOUR PROFILE</Text>
          <View style={styles.card}>
            <Input label="Display name" value={displayName} onChangeText={setDisplayName} />
            <Text style={styles.emailText}>{user?.email}</Text>
            <Button
              label={savingProfile ? 'Saving…' : 'Save Profile'}
              onPress={handleSaveProfile}
              isLoading={savingProfile}
              size="sm"
              variant="secondary"
            />
          </View>

          {/* Account actions */}
          <Text style={styles.groupLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={Colors.ink70} />
              <Text style={styles.actionText}>Sign Out</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.ink30} />
            </TouchableOpacity>
          </View>

          {/* Danger zone — owner only */}
          {isOwner && (
            <>
              <Text style={[styles.groupLabel, { color: Colors.error }]}>DANGER ZONE</Text>
              <View style={[styles.card, styles.dangerCard]}>
                <Text style={styles.dangerTitle}>Archive Choir</Text>
                <Text style={styles.dangerSub}>
                  Removes all members and hides the library.
                </Text>
                <TouchableOpacity style={styles.archiveBtn} onPress={handleArchive}>
                  <Ionicons name="archive-outline" size={18} color={Colors.error} />
                  <Text style={styles.archiveBtnText}>Archive Choir</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: 40 },

  groupLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.ink50,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },

  codeCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.ink10,
    gap: Spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inviteCode: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: Colors.p900,
    letterSpacing: 6,
  },
  copyBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.p50,
    alignItems: 'center', justifyContent: 'center',
  },
  codeSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.ink50,
    lineHeight: 18,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.ink10,
    gap: Spacing.base,
  },
  inputGroup: { gap: Spacing.lg },

  daySection: { gap: Spacing.sm },
  dayLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.4,
    color: Colors.ink50,
    textTransform: 'uppercase',
  },
  daysRow: { gap: Spacing.sm, paddingVertical: 4 },
  dayBtn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.ink10,
    backgroundColor: Colors.surfaceLow,
  },
  dayBtnActive: {
    backgroundColor: Colors.p800,
    borderColor: Colors.p800,
  },
  dayBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.ink50,
  },
  dayBtnTextActive: { color: Colors.white },

  emailText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.ink50,
  },

  errorWrap: {
    backgroundColor: Colors.errorBg,
    borderRadius: 10,
    padding: Spacing.base,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.error,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    paddingVertical: 4,
  },
  actionText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.ink70,
  },

  dangerCard: {
    borderColor: 'rgba(186,26,26,0.15)',
    backgroundColor: '#fff8f8',
  },
  dangerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.ink,
  },
  dangerSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.ink70,
    lineHeight: 18,
  },
  archiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.error,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  archiveBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.error,
  },
});
