import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../store/authStore';
import { useChoirStore } from '../../../store/choirStore';
import { useSetListStore } from '../../../store/setListStore';
import { subscribeChoir } from '../../../services/choirService';
import { subscribeSetLists } from '../../../services/setListService';
import {
  HeroCard, Card, EmptyState, ErrorState, Pill, SkeletonCard,
} from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Spacing, Radius } from '../../../constants/spacing';
import { formatDate, formatShortDate } from '../../../lib/utils';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { choir, setChoir } = useChoirStore();
  const { setLists, setSetLists } = useSetListStore();

  const [isLoading, setIsLoading]   = useState(true);
  const [hasError, setHasError]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const choirId = user?.choirId;

  const bootstrap = () => {
    if (!choirId) { setIsLoading(false); return; }
    setHasError(false);
    try {
      const unsub1 = subscribeChoir(choirId, (c) => { setChoir(c); setIsLoading(false); });
      const unsub2 = subscribeSetLists(choirId, setSetLists);
      return () => { unsub1(); unsub2(); };
    } catch {
      setHasError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => { return bootstrap(); }, [choirId]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const publishedLists = setLists.filter((sl) => sl.status === 'published');
  const nextService    = publishedLists[0] ?? null;
  const hour           = new Date().getHours();
  const greeting       = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName      = user?.displayName?.split(' ')[0] ?? '';

  const quickActions = [
    { icon: '📝', label: 'New Set List', onPress: () => router.push('/(app)/setlists/create') },
    { icon: '🎵', label: 'Song Library', onPress: () => router.push('/(app)/songs') },
    { icon: '👤', label: 'Invite Member', onPress: () => router.push('/(app)/invite') },
    { icon: '📢', label: 'Announce',     onPress: () => router.push('/(app)/announcements/create') },
  ];

  // ── No choir (new user who bypassed onboarding) ─────────────────────────────
  if (!choirId) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <EmptyState
          icon="🎼"
          title="No choir yet"
          description="Create or join a choir to get started."
          actionLabel="Get Started"
          onAction={() => router.push('/(app)/onboarding')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          {choir ? (
            <>
              <Text style={styles.choirName}>{choir.name}</Text>
              {choir.churchName && <Text style={styles.churchName}>{choir.churchName}</Text>}
            </>
          ) : (
            <View style={{ gap: 4 }}>
              <View style={styles.skelLine} />
              <View style={[styles.skelLine, { width: 80 }]} />
            </View>
          )}
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/(app)/announcements')}
          >
            <Text style={styles.iconBtnText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/(app)/choir-settings')}
          >
            <Text style={styles.iconBtnText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.p800} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Error state ─────────────────────────────────────────────── */}
        {hasError && (
          <ErrorState
            title="Couldn't load your dashboard"
            onRetry={() => { setIsLoading(true); bootstrap(); }}
          />
        )}

        {/* ── Loading skeletons ────────────────────────────────────────── */}
        {isLoading && !hasError && (
          <>
            <View style={styles.section}>
              <View style={[styles.skelLine, { width: 200, height: 28, borderRadius: 8 }]} />
              <View style={[styles.skelLine, { width: 260, height: 18, borderRadius: 6 }]} />
            </View>
            <SkeletonCard height={200} />
            <SkeletonCard height={160} lines={2} />
            <SkeletonCard height={120} lines={2} />
          </>
        )}

        {/* ── Loaded content ───────────────────────────────────────────── */}
        {!isLoading && !hasError && (
          <>
            {/* Welcome */}
            <View style={styles.section}>
              <Text style={styles.greeting}>{greeting}.</Text>
              <Text style={styles.greetingSub}>
                {nextService
                  ? 'Here is your upcoming ministry schedule.'
                  : 'Start by creating your first set list.'}
              </Text>
            </View>

            {/* Hero card */}
            {nextService ? (
              <TouchableOpacity
                onPress={() => router.push(`/(app)/setlists/${nextService.id}`)}
              >
                <HeroCard
                  eyebrow="Next Service"
                  badge={nextService.status}
                  title={nextService.title}
                  subtitle={formatDate(nextService.serviceDate)}
                  stats={[
                    { label: 'Songs',     value: nextService.songs.length },
                    { label: 'Published', value: publishedLists.length    },
                  ]}
                />
              </TouchableOpacity>
            ) : (
              <Card style={styles.emptyHero}>
                <EmptyState
                  icon="🎼"
                  title="No upcoming service"
                  description="Create a set list to plan your next worship service."
                  actionLabel="Create Set List"
                  onAction={() => router.push('/(app)/setlists/create')}
                />
              </Card>
            )}

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickGrid}>
              {quickActions.map((a) => (
                <TouchableOpacity key={a.label} style={styles.quickCard} onPress={a.onPress}>
                  <Text style={styles.quickIcon}>{a.icon}</Text>
                  <Text style={styles.quickLabel}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent Set Lists */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Set Lists</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/setlists')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {setLists.length === 0 ? (
              <Card style={styles.emptyCard}>
                <EmptyState
                  icon="📋"
                  title="No set lists yet"
                  description="Create your first set list to start planning."
                  actionLabel="Create Set List"
                  onAction={() => router.push('/(app)/setlists/create')}
                />
              </Card>
            ) : (
              <View style={styles.listStack}>
                {setLists.slice(0, 3).map((sl) => (
                  <TouchableOpacity
                    key={sl.id}
                    style={styles.listItem}
                    onPress={() => router.push(`/(app)/setlists/${sl.id}`)}
                  >
                    <View style={styles.listInfo}>
                      <Text style={styles.listTitle}>{sl.title}</Text>
                      <Text style={styles.listDate}>{formatShortDate(sl.serviceDate)}</Text>
                    </View>
                    <View style={styles.listRight}>
                      <Pill
                        label={sl.status}
                        variant={sl.status === 'published' ? 'published' : 'draft'}
                      />
                      <Text style={styles.chevron}>›</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
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
    paddingVertical: Spacing.base,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ink05,
  },
  choirName: { ...Typography.h3, color: Colors.p900 },
  churchName: { ...Typography.label, color: Colors.ink50 },
  skelLine: {
    height: 16, borderRadius: 6,
    backgroundColor: Colors.surfaceHigh,
    width: 120,
  },
  topActions: { flexDirection: 'row', gap: Spacing.xs },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceMid,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { fontSize: 18 },
  scroll: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 24 },
  section: { gap: Spacing.xs },
  greeting: { ...Typography.headlineXL, color: Colors.ink },
  greetingSub: { ...Typography.bodyLG, color: Colors.ink50 },
  emptyHero: { minHeight: 200, alignItems: 'center', justifyContent: 'center', padding: 0 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -Spacing.sm,
  },
  sectionTitle: { ...Typography.h3, color: Colors.ink },
  seeAll: { ...Typography.label, color: Colors.p600 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.ink10,
    padding: Spacing.base,
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  quickIcon: { fontSize: 24 },
  quickLabel: { ...Typography.bodyMed, color: Colors.ink },
  listStack: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.ink10,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
    borderBottomWidth: 1, borderBottomColor: Colors.ink05,
  },
  listInfo: { flex: 1, gap: 2 },
  listTitle: { ...Typography.bodyMed, color: Colors.ink },
  listDate: { ...Typography.label, color: Colors.ink50 },
  listRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  chevron: { fontSize: 20, color: Colors.ink30 },
  emptyCard: { padding: 0 },
});
