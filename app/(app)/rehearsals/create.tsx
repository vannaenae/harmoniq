import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuthStore } from '../../../store/authStore';
import { Button, Input, ScreenHeader } from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Spacing, Radius } from '../../../constants/spacing';
import { EventType } from '../../../types';

const EVENT_TYPES: Array<{ value: EventType; label: string; iconName: keyof typeof Ionicons.glyphMap }> = [
  { value: 'service',   label: 'Service',   iconName: 'business-outline' },
  { value: 'rehearsal', label: 'Rehearsal', iconName: 'musical-notes-outline' },
  { value: 'other',     label: 'Other',     iconName: 'pin-outline' },
];

export default function CreateRehearsalScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [title, setTitle]       = useState('');
  const [type, setType]         = useState<EventType>('rehearsal');
  const [date, setDate]         = useState('');
  const [startTime, setStartTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');

  const handleCreate = async () => {
    if (!title.trim()) { setError('Event title is required.'); return; }
    if (!date.trim() || !startTime.trim()) { setError('Date and time are required.'); return; }
    if (!user?.choirId) return;

    const startDate = new Date(`${date}T${startTime}`);
    if (isNaN(startDate.getTime())) { setError('Invalid date or time format.'); return; }

    setIsLoading(true);
    setError('');
    try {
      await addDoc(collection(db, 'choirs', user.choirId, 'events'), {
        choirId: user.choirId,
        title: title.trim(),
        type,
        startTime: startDate,
        endTime: new Date(startDate.getTime() + 60 * 60 * 1000),
        location: location.trim() || null,
        notes: notes.trim() || null,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      router.back();
    } catch {
      setError('Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="New Event"
        showBack
        rightElement={
          <Button label="Create" onPress={handleCreate} isLoading={isLoading} size="sm" />
        }
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Type */}
          <Text style={styles.groupLabel}>EVENT TYPE</Text>
          <View style={styles.typeRow}>
            {EVENT_TYPES.map((et) => (
              <TouchableOpacity
                key={et.value}
                style={[styles.typeBtn, type === et.value && styles.typeBtnActive]}
                onPress={() => setType(et.value)}
              >
                <Ionicons
                  name={et.iconName}
                  size={20}
                  color={type === et.value ? Colors.p800 : Colors.ink50}
                />
                <Text style={[styles.typeLabel, type === et.value && styles.typeLabelActive]}>
                  {et.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.groupLabel}>DETAILS</Text>
          <View style={styles.group}>
            <Input label="Event title *" placeholder="e.g. Sunday Rehearsal" value={title} onChangeText={setTitle} />
            <Input label="Date *" placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} keyboardType="numbers-and-punctuation" />
            <Input label="Start time *" placeholder="HH:MM (24hr)" value={startTime} onChangeText={setStartTime} keyboardType="numbers-and-punctuation" />
            <Input label="Location" placeholder="e.g. Main Hall" value={location} onChangeText={setLocation} />
            <Input
              label="Notes"
              placeholder="Rehearsal agenda, preparation notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, paddingTop: 10 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { padding: Spacing.lg, gap: Spacing.base, paddingBottom: 32 },
  groupLabel: {
    ...Typography.caption, color: Colors.ink50, letterSpacing: 1.5,
  },
  typeRow: { flexDirection: 'row', gap: Spacing.sm },
  typeBtn: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.ink10,
    backgroundColor: Colors.surface, gap: 4,
  },
  typeBtnActive: { borderColor: Colors.p800, backgroundColor: Colors.p50 },
  typeLabel: { ...Typography.label, color: Colors.ink50 },
  typeLabelActive: { color: Colors.p800, fontWeight: '600' },
  group: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.base,
    gap: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.ink10,
  },
  error: {
    ...Typography.bodyMed, color: Colors.error,
    backgroundColor: Colors.errorBg, padding: Spacing.md, borderRadius: 12,
  },
});
