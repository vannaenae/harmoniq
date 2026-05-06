import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuthStore } from '../../../store/authStore';
import { Card, LoadingState, ScreenHeader } from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Spacing } from '../../../constants/spacing';
import { RehearsalEvent } from '../../../types';
import { formatDate, formatTime } from '../../../lib/utils';

export default function RehearsalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<RehearsalEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.choirId || !id) return;
    return onSnapshot(doc(db, 'choirs', user.choirId, 'events', id), (snap) => {
      if (!snap.exists()) { setIsLoading(false); return; }
      const d = snap.data();
      setEvent({
        ...d, id: snap.id,
        startTime: d.startTime?.toDate?.() ?? new Date(),
        endTime:   d.endTime?.toDate?.()   ?? new Date(),
        createdAt: d.createdAt?.toDate?.() ?? new Date(),
      } as RehearsalEvent);
      setIsLoading(false);
    });
  }, [user?.choirId, id]);

  if (isLoading) return <LoadingState fullScreen />;
  if (!event)    return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Event" showBack />
      <Text style={styles.notFound}>Event not found.</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={event.title} showBack />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.label}>DATE & TIME</Text>
          <Text style={styles.value}>{formatDate(event.startTime)}</Text>
          <Text style={styles.sub}>{formatTime(event.startTime)} – {formatTime(event.endTime)}</Text>
        </Card>
        {event.location && (
          <Card>
            <Text style={styles.label}>LOCATION</Text>
            <Text style={styles.value}>{event.location}</Text>
          </Card>
        )}
        {event.notes && (
          <Card>
            <Text style={styles.label}>NOTES</Text>
            <Text style={styles.body}>{event.notes}</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { padding: Spacing.lg, gap: Spacing.base, paddingBottom: 32 },
  label: { ...Typography.caption, color: Colors.ink50, letterSpacing: 1.5, marginBottom: Spacing.xs },
  value: { ...Typography.h3, color: Colors.ink },
  sub: { ...Typography.body, color: Colors.ink50 },
  body: { ...Typography.body, color: Colors.ink, lineHeight: 24 },
  notFound: { ...Typography.body, color: Colors.ink50, textAlign: 'center', marginTop: Spacing.xl },
});
