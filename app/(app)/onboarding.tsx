import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Modal, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createChoir, joinChoirByCode } from '../../services/choirService';
import { useAuthStore } from '../../store/authStore';
import { useChoirStore } from '../../store/choirStore';
import { Button, Input } from '../../components/ui';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';

type Step = 'choose' | 'create' | 'join';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function DayPicker({
  label,
  iconName,
  value,
  onChange,
  accentColor,
}: {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  value: string;
  onChange: (v: string) => void;
  accentColor: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <View style={[styles.dayCard, { borderColor: Colors.ink10 }]}>
        <View style={styles.dayCardTop}>
          <Ionicons name={iconName} size={16} color={accentColor} />
          <Text style={[styles.dayCardLabel, { color: accentColor }]}>{label}</Text>
        </View>
        <TouchableOpacity style={styles.daySelect} onPress={() => setOpen(true)} activeOpacity={0.7}>
          <Text style={styles.dayValue}>{value}</Text>
          <Ionicons name="chevron-down" size={18} color={Colors.p800} />
        </TouchableOpacity>
      </View>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{label}</Text>
            {DAYS.map(day => (
              <TouchableOpacity
                key={day}
                style={[styles.dayOption, value === day && styles.dayOptionActive]}
                onPress={() => { onChange(day); setOpen(false); }}
              >
                <Text style={[styles.dayOptionText, value === day && styles.dayOptionTextActive]}>{day}</Text>
                {value === day && <Ionicons name="checkmark" size={18} color={Colors.p800} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setChoir } = useChoirStore();

  const [step, setStep]           = useState<Step>('choose');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const [choirName, setChoirName]       = useState('');
  const [churchName, setChurchName]     = useState('');
  const [serviceDay, setServiceDay]     = useState('Sunday');
  const [rehearsalDay, setRehearsalDay] = useState('Wednesday');
  const [inviteCode, setInviteCode]     = useState('');

  const back = () => { setStep('choose'); setError(''); };

  const handleCreate = async () => {
    if (!choirName.trim()) { setError('Please enter a choir name.'); return; }
    if (!user?.uid) return;
    setIsLoading(true); setError('');
    try {
      const choir = await createChoir(user.uid, choirName.trim(), churchName.trim() || undefined, serviceDay, rehearsalDay);
      setChoir(choir);
      router.replace('/(app)/(tabs)');
    } catch {
      setError('Failed to create choir. Please try again.');
    } finally { setIsLoading(false); }
  };

  const handleJoin = async () => {
    if (inviteCode.trim().length < 6) { setError('Enter a valid 6-character invite code.'); return; }
    if (!user?.uid) return;
    setIsLoading(true); setError('');
    try {
      const choir = await joinChoirByCode(user.uid, inviteCode.trim());
      setChoir(choir);
      router.replace('/(app)/(tabs)');
    } catch {
      setError('Invalid code. Check with your choir admin and try again.');
    } finally { setIsLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Back button — only on create/join steps */}
        {step !== 'choose' && (
          <TouchableOpacity style={styles.backBtn} onPress={back}>
            <Ionicons name="arrow-back" size={22} color={Colors.p900} />
          </TouchableOpacity>
        )}

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── CHOOSE ── */}
          {step === 'choose' && (
            <View style={styles.section}>
              <Text style={styles.welcomeTitle}>Welcome to Harmoniq</Text>
              <Text style={styles.welcomeSub}>
                {user?.displayName?.split(' ')[0] ? `Hi ${user.displayName.split(' ')[0]}, get` : 'Get'} started by creating a new choir or joining an existing one.
              </Text>

              {/* Create card */}
              <TouchableOpacity style={styles.choiceCard} onPress={() => setStep('create')} activeOpacity={0.85}>
                <View style={[styles.choiceIconWrap, { backgroundColor: Colors.p50 }]}>
                  <Ionicons name="add-circle-outline" size={28} color={Colors.p800} />
                </View>
                <View style={styles.choiceTextGroup}>
                  <Text style={styles.choiceTitle}>Create a Choir</Text>
                  <Text style={styles.choiceDesc}>
                    Establish a new workspace for your ministry. Build your roster, set lists, and align your team.
                  </Text>
                </View>
                <View style={styles.choiceArrowRow}>
                  <Text style={styles.choiceArrowLabel}>START BUILDING</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.p800} />
                </View>
              </TouchableOpacity>

              {/* Join card */}
              <TouchableOpacity style={[styles.choiceCard, styles.choiceCardSecondary]} onPress={() => setStep('join')} activeOpacity={0.85}>
                <View style={[styles.choiceIconWrap, { backgroundColor: '#ffedf8' }]}>
                  <Ionicons name="people-outline" size={28} color={Colors.secondary} />
                </View>
                <View style={styles.choiceTextGroup}>
                  <Text style={styles.choiceTitle}>Join a Choir</Text>
                  <Text style={styles.choiceDesc}>
                    Have an invitation code? Connect with your worship team to access services and coordinate your availability.
                  </Text>
                </View>
                <View style={styles.choiceArrowRow}>
                  <Text style={[styles.choiceArrowLabel, { color: Colors.secondary }]}>ENTER CODE</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.secondary} />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* ── CREATE ── */}
          {step === 'create' && (
            <View style={styles.section}>
              <Text style={styles.stepTitle}>Create your Choir.</Text>
              <Text style={styles.stepSub}>Establish the foundation for your worship team.</Text>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <View style={styles.fieldsGroup}>
                <Input
                  label="Choir Name"
                  placeholder="e.g. Sanctuary Choir"
                  value={choirName}
                  onChangeText={setChoirName}
                />
                <Input
                  label="Church Name"
                  placeholder="e.g. Grace Community Church"
                  value={churchName}
                  onChangeText={setChurchName}
                />
              </View>

              <View style={styles.daysGrid}>
                <DayPicker
                  label="DEFAULT SERVICE DAY"
                  iconName="calendar-outline"
                  value={serviceDay}
                  onChange={setServiceDay}
                  accentColor={Colors.p800}
                />
                <DayPicker
                  label="REHEARSAL DAY"
                  iconName="musical-notes-outline"
                  value={rehearsalDay}
                  onChange={setRehearsalDay}
                  accentColor={Colors.secondary}
                />
              </View>

              <Button
                label="Create Choir"
                onPress={handleCreate}
                isLoading={isLoading}
                fullWidth
                size="lg"
              />
            </View>
          )}

          {/* ── JOIN ── */}
          {step === 'join' && (
            <View style={styles.section}>
              <View style={styles.joinIconWrap}>
                <Ionicons name="people-outline" size={40} color={Colors.secondary} />
              </View>
              <Text style={styles.stepTitle}>Join a Choir</Text>
              <Text style={styles.stepSub}>Enter the 6-character invite code from your director.</Text>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Input
                label="Invite Code"
                placeholder="e.g. A1B2C3"
                autoCapitalize="characters"
                maxLength={6}
                value={inviteCode}
                onChangeText={setInviteCode}
              />

              <Button
                label="Join Choir"
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
  safe:   { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 40 },

  backBtn: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xs,
    alignSelf: 'flex-start',
  },

  section: { gap: Spacing.xl },

  // Choose step
  welcomeTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    letterSpacing: -0.8,
    color: Colors.ink,
    lineHeight: 38,
  },
  welcomeSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.ink50,
    lineHeight: 24,
    marginTop: -Spacing.base,
  },

  choiceCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.ink10,
    gap: Spacing.base,
    shadowColor: Colors.p900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  choiceCardSecondary: {
    borderColor: 'rgba(145,61,140,0.12)',
  },
  choiceIconWrap: {
    width: 52, height: 52,
    borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  choiceTextGroup: { gap: 6 },
  choiceTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  choiceDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.ink50,
    lineHeight: 21,
  },
  choiceArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
  },
  choiceArrowLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.p800,
  },

  // Create step
  stepTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    letterSpacing: -0.8,
    color: Colors.ink,
    lineHeight: 38,
  },
  stepSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.ink50,
    lineHeight: 22,
    marginTop: -Spacing.base,
  },
  fieldsGroup: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.ink10,
  },
  daysGrid: { flexDirection: 'row', gap: Spacing.base },

  // Day picker card
  dayCard: {
    flex: 1,
    backgroundColor: Colors.surfaceLow,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  dayCardTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dayCardLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  daySelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(26,3,96,0.25)',
    paddingBottom: 6,
    paddingTop: 10,
  },
  dayValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.p900,
    letterSpacing: -0.3,
  },

  // Day modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: 40,
    gap: 4,
  },
  modalHandle: {
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: Colors.ink10,
    alignSelf: 'center',
    marginBottom: Spacing.base,
  },
  modalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.ink,
    marginBottom: Spacing.base,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  dayOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ink10,
  },
  dayOptionActive: { },
  dayOptionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 17,
    color: Colors.ink,
  },
  dayOptionTextActive: {
    fontFamily: 'Inter_700Bold',
    color: Colors.p800,
  },

  // Join step
  joinIconWrap: {
    width: 72, height: 72,
    borderRadius: 20,
    backgroundColor: '#ffedf8',
    alignItems: 'center', justifyContent: 'center',
  },

  error: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.error,
    backgroundColor: Colors.errorBg,
    padding: Spacing.base,
    borderRadius: 12,
  },
});
