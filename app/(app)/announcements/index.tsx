import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  collection, query, orderBy, onSnapshot,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuthStore } from '../../../store/authStore';
import { EmptyState, SkeletonCard } from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Spacing, Radius } from '../../../constants/spacing';
import { Announcement } from '../../../types';
import { formatShortDate } from '../../../lib/utils';

const PRIORITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  important: { bg: '#FEF3C7', text: '#D97706', label: 'Important' },
  update:    { bg: Colors.p50,         text: Colors.p700,       label: 'Update'    },
  new:       { bg: '#F0FFF4',           text: Colors.success,    label: 'New'       },
};

export default function AnnouncementsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === 'owner' || user?.role === 'leader';

  useEffect(() => {
    if (!user?.choirId) return;
    const q = query(
      collection(db, 'choirs', user.choirId, 'announcements'),
      orderBy('createdAt', 'desc'),
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
      setIsLoading(false);
    });
  }, [user?.choirId]);

  const renderItem = ({ item }: { item: Announcement }) => {
    const priority = item.pinned ? PRIORITY_COLORS.important : PRIORITY_COLORS.update;
    return (
      <View style={styles.card}>
        {/* Card header */}
        <View style={styles.cardHeader}>
          {item.pinned && (
            <View style={[styles.tagPill, { backgroundColor: priority.bg }]}>
              <Ionicons name="alert-circle" size={11} color={priority.text} />
              <Text style={[styles.tagText, { color: priority.text }]}>Important</Text>
            </View>
          )}
          <Text style={styles.cardDate}>{formatShortDate(item.createdAt)}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardBody} numberOfLines={3}>{item.body}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardAuthor}>{item.authorName}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top nav */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(app)/choir-settings')}>
          <Ionicons name="menu" size={22} color={Colors.p900} />
        </TouchableOpacity>
        <Text style={styles.navLogo}>Harmoniq</Text>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(app)/announcements')}>
          <Ionicons name="notifications-outline" size={22} color={Colors.p900} />
        </TouchableOpacity>
      </View>

      {/* Page heading */}
      <View style={styles.pageHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Ministry News</Text>
          <Text style={styles.pageSub}>
            Stay updated with the latest rehearsals, community notes, and spiritual guidance.
          </Text>
        </View>
        {isAdmin && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/(app)/announcements/create')}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading && (
        <View style={{ padding: Spacing.lg, gap: Spacing.base }}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} height={120} lines={3} />)}
        </View>
      )}

      {!isLoading && announcements.length === 0 && (
        <EmptyState
          iconName="megaphone-outline"
          title="No announcements"
          description={
            isAdmin
              ? 'Post an announcement to keep your team informed.'
              : 'No announcements from your director yet.'
          }
          actionLabel={isAdmin ? 'Post Announcement' : undefined}
          onAction={isAdmin ? () => router.push('/(app)/announcements/create') : undefined}
        />
      )}

      {!isLoading && announcements.length > 0 && (
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

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(94,82,166,0.08)',
  },
  navBtn:  { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navLogo: {
    fontFamily: 'Inter_900Black',
    fontSize: 20,
    fontStyle: 'italic',
    letterSpacing: -0.8,
    color: Colors.p900,
  },

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
    gap: Spacing.base,
  },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    letterSpacing: -0.8,
    color: Colors.ink,
    lineHeight: 38,
  },
  pageSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.ink70,
    lineHeight: 20,
    marginTop: 4,
  },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.p800,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
  },

  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100, gap: Spacing.base },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.ink10,
    gap: Spacing.sm,
    shadowColor: Colors.p900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  cardDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.ink50,
    marginLeft: 'auto',
  },
  cardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: Colors.ink,
    lineHeight: 24,
  },
  cardBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.ink70,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cardAuthor: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.ink50,
  },
});
