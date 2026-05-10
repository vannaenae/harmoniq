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

function DaySelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <View style={styles.daySelectorWrap}>
        <Text style={styles.dayLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.dayBtn}
          onPress={() => setOpen(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dayValue}>{value}</Text>
          <Ionicons name="chevron-down" size={18} color={Colors.ink50} />
        </TouchableOpacity>
      </View>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{label}</Text>
            {DAYS.map(day => (
              <TouchableOpacity
                key={day}
                style={styles.dayOption}
                onPress={() => { onChange(day); setOpen(false); }}
              >
                <Text style={[styles.dayOptionText, value === day && styles.dayOptionActive]}>
                  {day}
                </Text>
                {value === day && (
                  <Ionicons name="checkmark" size={18} color={Colors.p800} />
                )}
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

  // Create form
  const [choirName, setChoirName]       = useState('');
  const [churchName, setChurchName]     = useState('');
  const [serviceDay, setServiceDay]     = useState('Sunday');
  const [rehearsalDay, setRehearsalDay] = useState('Wednesday');

  // Join form
  const [inviteCode, setInviteCode] = useState('');

  const back = () => { setStep('choose'); setError(''); };

  const handleCreate = async () => {
    if (!choirName.trim()) { setError('Please enter a choir name.'); return; }
    if (!user?.uid) return;
    setIsLoading(true);
    setError('');
    try {
      const choir = await createChoir(
        user.uid, choirName.trim(),
        churchName.trim() || undefined,
        serviceDay, rehearsalDay,
      );
      setChoir(choir);
      router.replace('/(app)/(tabs)');
    } catch {
      setError('Failed to create choir. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (inviteCode.trim().length < 6) {
      setError('Enter a valid 6-character invite code.');
      return;
    }
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

  // ── CHOOSE ──────────────────────────────────────────────────────────────
  if (step === 'choose') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.chooseWrap}>
          <View style={styles.chooseHero}>
            <Text style={styles.chooseTitle}>Welcome to Harmoniq</Text>
            <Text style={styles.chooseSub}>
              {user?.displayName?.split(' ')[0]
                ? `Hi ${user.displayName!.split(' ')[0]}, get started by creating a new choir or joining an existing one.`
                : 'Get started by creating a new choir or joining an existing one.'}
            </Text>
          </View>

          <View style={styles.chooseCards}>
            {/* Create */}
            <TouchableOpacity
              style={styles.choiceCard}
              onPress={() => setStep('create')}
              activeOpacity={0.85}
            >
              <View style={styles.choiceIconWrap}>
                <Ionicons name="add-circle-outline" size={28} color={Colors.p800} />
              </View>
              <View style={styles.choiceText}>
                <Text style={styles.choiceTitle}>Create a Choir</Text>
                <Text style={styles.choiceDesc}>
                  Establish a new workspace for your ministry. Build your roster, set lists, and align your team.
                </Text>
              </View>
              <View style={styles.choiceFooter}>
                <Text style={styles.choiceAction}>START BUILDING</Text>
                <Ionicons name="arrow-forward" size={14} color={Colors.p800} />
              </View>
            </TouchableOpacity>

            {/* Join */}
            <TouchableOpacity
              style={[styles.choiceCard, styles.choiceCardJoin]}
              onPress={() => setStep('join')}
              activeOpacity={0.85}
            >
              <View style={[styles.choiceIconWrap, styles.choiceIconJoin]}>
                <Ionicons name="people-outline" size={28} color={Colors.secondary} />
              </View>
              <View style={styles.choiceText}>
                <Text style={styles.choiceTitle}>Join a Choir</Text>
                <Text style={styles.choiceDesc}>
                  Have an invitation code? Connect with your worship team to access services and coordinate your availability.
                </Text>
              </View>
              <View style={styles.choiceFooter}>
                <Text style={[styles.choiceAction, { color: Colors.secondary }]}>ENTER CODE</Text>
                <Ionicons name="arrow-forward" size={14} color={Colors.secondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── CREATE ──────────────────────────────────────────────────────────────
  if (step === 'create') {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={back}>
          <Ionicons name="arrow-back" size={22} color={Colors.p900} />
        </TouchableOpacity>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.formScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.stepTitle}>Create your Choir.</Text>
            <Text style={styles.stepSub}>
              Establish the foundation for your worship team. These details coordinate your set lists, members, and rehearsals seamlessly.
            </Text>

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Fields */}
            <View style={styles.fieldsCard}>
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

            {/* Day selectors */}
            <DaySelector
              label="Default Service Day"
              value={serviceDay}
              onChange={setServiceDay}
            />
            <DaySelector
              label="Rehearsal Day"
              value={rehearsalDay}
              onChange={setRehearsalDay}
            />

            <Button
              label="Finish Setup"
              onPress={handleCreate}
              isLoading={isLoading}
              fullWidth
              size="lg"
              rightIcon={<Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ── JOIN ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.joinIconWrap}>
            <Ionicons name="people-outline" size={36} color={Colors.secondary} />
          </View>

          <Text style={styles.stepTitle}>Join Choir</Text>
          <Text style={styles.stepSub}>
            Enter the 6-digit invite code provided by your worship leader or coordinator.
          </Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

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
            rightIcon={<Ionicons name="arrow-forward" size={18} color={Colors.white} />}
          />

          <TouchableOpacity style={styles.requestCodeRow} onPress={back}>
            <Text style={styles.requestCodeText}>Request an invite code</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },

  backBtn: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xs,
    alignSelf: 'flex-start',
  },

  // ── CHOOSE ──
  chooseWrap: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: 40,
    gap: Spacing.xl,
  },
  chooseHero: { gap: Spacing.sm },
  chooseTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    letterSpacing: -0.8,
    color: Colors.ink,
    lineHeight: 38,
  },
  chooseSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.ink70,
    lineHeight: 24,
  },
  chooseCards: { gap: Spacing.base },

  choiceCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.ink10,
    gap: Spacing.base,
    shadowColor: Colors.p900,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  choiceCardJoin: {
    borderColor: 'rgba(145,61,140,0.18)',
  },
  choiceIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: Colors.p50,
    alignItems: 'center', justifyContent: 'center',
  },
  choiceIconJoin: { backgroundColor: '#ffedf8' },
  choiceText: { gap: 6 },
  choiceTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  choiceDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.ink70,
    lineHeight: 21,
  },
  choiceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
  },
  choiceAction: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.p800,
  },

  // ── FORM ──
  formScroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.xl,
  },
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
    color: Colors.ink70,
    lineHeight: 22,
    marginTop: -Spacing.base,
  },
  fieldsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.ink10,
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

  // Day selector
  daySelectorWrap: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.ink10,
    gap: Spacing.sm,
  },
  dayLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.4,
    color: Colors.ink50,
    textTransform: 'uppercase',
  },
  dayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.ink10,
    paddingBottom: 8,
    paddingTop: 4,
  },
  dayValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.ink,
    letterSpacing: -0.3,
  },

  // Modal
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
    paddingBottom: 48,
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
    fontSize: 14,
    color: Colors.ink50,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: Spacing.base,
  },
  dayOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ink10,
  },
  dayOptionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 17,
    color: Colors.ink,
  },
  dayOptionActive: {
    fontFamily: 'Inter_700Bold',
    color: Colors.p800,
  },

  // Join
  joinIconWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: '#ffedf8',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  requestCodeRow: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  requestCodeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.p500,
  },
});
