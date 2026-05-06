import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createSetList } from '../../../services/setListService';
import { useAuthStore } from '../../../store/authStore';
import { Button, Input, ScreenHeader } from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Spacing, Radius } from '../../../constants/spacing';
import { SetListStatus } from '../../../types';

export default function CreateSetListScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [title, setTitle]   = useState('');
  const [date, setDate]     = useState('');
  const [notes, setNotes]   = useState('');
  const [status, setStatus] = useState<SetListStatus>('draft');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleCreate = async () => {
    if (!title.trim()) { setError('Please enter a service title.'); return; }
    if (!date.trim())  { setError('Please enter a service date.'); return; }
    if (!user?.choirId) return;

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) { setError('Please enter a valid date (YYYY-MM-DD).'); return; }

    setIsLoading(true);
    setError('');
    try {
      await createSetList(user.choirId, {
        choirId: user.choirId,
        title: title.trim(),
        serviceDate: parsedDate,
        status,
        notes: notes.trim() || undefined,
        songs: [],
        createdBy: user.uid,
      });
      router.back();
    } catch {
      setError('Failed to create set list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="New Set List"
        showBack
        rightElement={
          <Button label="Create" onPress={handleCreate} isLoading={isLoading} size="sm" />
        }
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.group}>
            <Input label="Service title *" placeholder="e.g. Sunday Morning Worship" value={title} onChangeText={setTitle} />
            <Input label="Service date *" placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} keyboardType="numbers-and-punctuation" />
            <Input
              label="General notes"
              placeholder="Theme, special instructions..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, paddingTop: 10 }}
            />
          </View>

          <Text style={styles.sectionLabel}>Status</Text>
          <View style={styles.statusRow}>
            {(['draft', 'published'] as SetListStatus[]).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusBtn, status === s && styles.statusBtnActive]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.statusLabel, status === s && styles.statusLabelActive]}>
                  {s === 'draft' ? 'Draft' : 'Published'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { padding: Spacing.lg, gap: Spacing.base, paddingBottom: 32 },
  group: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.base,
    gap: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.ink10,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.ink50,
    letterSpacing: 1.5,
  },
  statusRow: { flexDirection: 'row', gap: Spacing.sm },
  statusBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.ink10,
    backgroundColor: Colors.surface,
  },
  statusBtnActive: { borderColor: Colors.p800, backgroundColor: Colors.p50 },
  statusLabel: { ...Typography.bodyMed, color: Colors.ink50 },
  statusLabelActive: { color: Colors.p800 },
  error: {
    ...Typography.bodyMed,
    color: Colors.error,
    backgroundColor: Colors.errorBg,
    padding: Spacing.md,
    borderRadius: 12,
  },
});
