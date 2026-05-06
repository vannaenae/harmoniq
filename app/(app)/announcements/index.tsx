import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  collection, query, orderBy, onSnapshot,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuthStore } from '../../../store/authStore';
import { Button, Card, EmptyState, ScreenHeader } from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Spacing, Radius } from '../../../constants/spacing';
import { Announcement } from '../../../types';
import { formatShortDate } from '../../../lib/utils';

export default function AnnouncementsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const isAdmin = user?.role === 'owner' || user?.role === 'leader';

  useEffect(() => {
    if (!user?.choirId) return;
    const q = query(
      collection(db, 'choirs', user.choirId, 'announcements'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
        } as Announcement;
      });
      setAnnouncements(items);
    });
  }, [user?.choirId]);

  const renderItem = ({ item }: { item: Announcement }) => (
    <Card style={styles.card}>
      {item.pinned && <Text style={styles.pinnedLabel}>📌 PINNED</Text>}
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardBody}>{item.body}</Text>
      <View style={styles.cardMeta}>
        <Text style={styles.cardAuthor}>{item.authorName}</Text>
        <Text style={styles.cardDate}>{formatShortDate(item.createdAt)}</Text>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Announcements"
        showBack
        rightElement={
          isAdmin ? (
            <Button
              label="+ New"
              onPress={() => router.push('/(app)/announcements/create')}
              size="sm"
            />
          ) : null
        }
      />

      {announcements.length === 0 ? (
        <EmptyState
          icon="📢"
          title="No announcements"
          description={isAdmin ? 'Post an announcement to keep your team informed.' : 'No announcements from your director yet.'}
          actionLabel={isAdmin ? 'Post Announcement' : undefined}
          onAction={isAdmin ? () => router.push('/(app)/announcements/create') : undefined}
        />
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },
  list: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: 24 },
  card: { gap: Spacing.sm },
  pinnedLabel: { ...Typography.micro, color: Colors.p600, letterSpacing: 1 },
  cardTitle: { ...Typography.h3, color: Colors.ink },
  cardBody: { ...Typography.body, color: Colors.ink70, lineHeight: 22 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs },
  cardAuthor: { ...Typography.label, color: Colors.ink50 },
  cardDate: { ...Typography.label, color: Colors.ink30 },
});
