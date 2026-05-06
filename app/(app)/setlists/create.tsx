import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createSetList } from '../../../services/setListService';
import { useAuthStore } from '../../../store/authStore';
import { Button, Input } from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Spacing, Radius } from '../../../constants/spacing';
import { SetListStatus } from '../../../types';

export default function CreateSetListScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [title, setTitle]   = useState('');
  const [date, setDate]     = useState('');
  const [time, setTime]     = useState('');
  const [notes, setNotes]   = useState('');
  const [status, setStatus] = useState<SetListStatus>('draft');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleCreate = async () => {
    if (!date.trim()) { setError('Please enter a service date.'); return; }
    if (!user?.choirId) return;

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) { setError('Please enter a valid date (YYYY-MM-DD).'); return; }

    setIsLoading(true);
    setError('');
    try {
      await createSetList(user.choirId, {
        choirId: user.choirId,
        title: title.trim() || `Service – ${date}`,
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Set List</Text>
        <View style={styles.closeBtnSpacer} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.group}>
            <Input
              label="Service Title"
              placeholder="e.g. Sunday Morning Worship"
              value={title}
              onChangeText={setTitle}
            />

            <View style={styles.rowFields}>
              <View style={styles.rowField}>
                <Input
                  label="Date"
                  placeholder="YYYY-MM-DD"
                  value={date}
                  onChangeText={setDate}
                  keyboardType="numbers-and-punctuation"
                  rightIcon={<Ionicons name="calendar-outline" size={18} color={Colors.ink50} />}
                />
              </View>
              <View style={styles.rowField}>
                <Input
                  label="Service Time"
                  placeholder="HH:MM"
                  value={time}
                  onChangeText={setTime}
                  keyboardType="numbers-and-punctuation"
                  rightIcon={<Ionicons name="time-outline" size={18} color={Colors.ink50} />}
                />
              </View>
            </View>

            <Input
              label="Service Notes & Theme"
              placeholder="Theme, special instructions, or notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, paddingTop: 10 }}
            />
          </View>

          {/* Status row */}
          <Text style={styles.sectionLabel}>STATUS</Text>
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

          {/* CTA */}
          <Button
            label="Create Set List"
            onPress={handleCreate}
            isLoading={isLoading}
            fullWidth
            size="lg"
            rightIcon={<Ionicons name="arrow-forward" size={18} color={Colors.white} />}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ink10,
    backgroundColor: Colors.surface,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceMid,
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnSpacer: { width: 36 },
  headerTitle: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  scroll: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 40 },

  group: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.base,
    gap: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.ink10,
  },
  rowFields: { flexDirection: 'row', gap: Spacing.base },
  rowField:  { flex: 1 },

  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.ink50,
    textTransform: 'uppercase',
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
  statusBtnActive:  { borderColor: Colors.p800, backgroundColor: Colors.p50 },
  statusLabel:      { fontFamily: 'Inter_500Medium', fontSize: 15, color: Colors.ink50 },
  statusLabelActive: { color: Colors.p800, fontFamily: 'Inter_600SemiBold' },

  error: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.error,
    backgroundColor: Colors.errorBg,
    padding: Spacing.base,
    borderRadius: 12,
  },
});
