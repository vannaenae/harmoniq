import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuthStore } from '../../../store/authStore';
import { useChoirStore } from '../../../store/choirStore';
import { useSetListStore } from '../../../store/setListStore';
import { subscribeChoir } from '../../../services/choirService';
import { subscribeSetLists } from '../../../services/setListService';
import { subscribeUpcomingEvents } from '../../../services/rehearsalService';
import { EmptyState, ErrorState, SkeletonCard } from '../../../components/ui';
import { Colors, Gradients } from '../../../constants/colors';
import { Spacing, Radius } from '../../../constants/spacing';
import { RehearsalEvent } from '../../../types';
import { formatDate, formatTime } from '../../../lib/utils';

const EVENT_TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  service:   'business-outline',
  rehearsal: 'musical-notes-outline',
  other:     'pin-outline',
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { choir, setChoir } = useChoirStore();
  const { setLists, setSetLists } = useSetListStore();

  const [isLoading, setIsLoading]           = useState(true);
  const [hasError, setHasError]             = useState(false);
  const [refreshing, setRefreshing]         = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<RehearsalEvent[]>([]);
  const [myAvailability, setMyAvailability] = useState<'available' | 'unavailable' | 'maybe' | null>(null);

  const choirId = user?.choirId;
  const isAdmin = user?.role === 'owner' || user?.role === 'leader';

  const bootstrap = () => {
    if (!choirId) { setIsLoading(false); return; }
    setHasError(false);
    try {
      const u1 = subscribeChoir(choirId, (c) => { setChoir(c); setIsLoading(false); });
      const u2 = subscribeSetLists(choirId, setSetLists);
      const u3 = subscribeUpcomingEvents(choirId, setUpcomingEvents);
      return () => { u1(); u2(); u3(); };
    } catch {
      setHasError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => { return bootstrap(); }, [choirId]);

  // Load current user's availability for the next published set list
  useEffect(() => {
    if (!choirId || !user?.uid) return;
    const nextPublished = setLists.find((sl) => {
      const d = typeof sl.serviceDate === 'string' ? new Date(sl.serviceDate) : sl.serviceDate;
      return sl.status === 'published' && d >= new Date();
    });
    if (!nextPublished) { setMyAvailability(null); return; }

    const docId = `${nextPublished.id}_${user.uid}`;
    const q = query(
      collection(db, 'choirs', choirId, 'availability'),
      where('userId', '==', user.uid),
      where('setListId', '==', nextPublished.id),
    );
    return onSnapshot(q, (snap) => {
      if (snap.empty) { setMyAvailability(null); return; }
      setMyAvailability(snap.docs[0].data().status ?? null);
    });
  }, [choirId, user?.uid, setLists]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const nextService = setLists.find((sl) => {
    const d = typeof sl.serviceDate === 'string' ? new Date(sl.serviceDate) : sl.serviceDate;
    return sl.status === 'published' && d >= new Date();
  }) ?? null;

  const availStatusCfg: Record<string, { text: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
    available:   { text: 'You are confirmed for the next service.',   color: Colors.success, icon: 'checkmark-circle'  },
    unavailable: { text: 'You marked yourself unavailable.',          color: Colors.error,   icon: 'close-circle'      },
    maybe:       { text: 'You marked yourself as not sure.',          color: Colors.warning, icon: 'help-circle'       },
  };

  if (!choirId) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <EmptyState
          iconName="musical-notes-outline"
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

      {/* ── Top nav ── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.push('/(app)/choir-settings')}
        >
          <Ionicons name="menu" size={22} color={Colors.p900} />
        </TouchableOpacity>
        <Text style={styles.navLogo}>Harmoniq</Text>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.push('/(app)/announcements')}
        >
          <Ionicons name="notifications-outline" size={22} color={Colors.p900} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.p800} />
        }
        showsVerticalScrollIndicator={false}
      >
        {hasError && (
          <ErrorState
            title="Couldn't load dashboard"
            onRetry={() => { setIsLoading(true); bootstrap(); }}
          />
        )}

        {isLoading && !hasError && (
          <>
            <SkeletonCard height={28} lines={1} />
            <SkeletonCard height={200} />
            <SkeletonCard height={160} lines={2} />
          </>
        )}

        {!isLoading && !hasError && (
          <>
            {/* Greeting */}
            <View style={styles.greeting}>
              <Text style={styles.greetingText}>{greeting}.</Text>
              <Text style={styles.greetingSub}>
                {nextService
                  ? 'Here is your upcoming ministry schedule.'
                  : 'Start by creating your first set list.'}
              </Text>
            </View>

            {/* ── Hero: Next Service ── */}
            {nextService ? (
              <TouchableOpacity
                onPress={() => router.push(`/(app)/setlists/${nextService.id}`)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={Gradients.hero}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.hero}
                >
                  <View style={styles.heroTop}>
                    <Text style={styles.heroEyebrow}>NEXT SERVICE</Text>
                    <View style={styles.heroBadge}>
                      <Text style={styles.heroBadgeText}>PUBLISHED</Text>
                    </View>
                  </View>

                  <Text style={styles.heroTitle}>{nextService.title}</Text>

                  <View style={styles.heroDateRow}>
                    <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.75)" />
                    <Text style={styles.heroDate}>{formatDate(nextService.serviceDate)}</Text>
                  </View>

                  <View style={styles.heroDivider} />

                  <View style={styles.heroStats}>
                    <View style={styles.heroStat}>
                      <Text style={styles.heroStatNum}>{nextService.songs.length}</Text>
                      <Text style={styles.heroStatLabel}>Songs</Text>
                    </View>
                    <View style={styles.heroStat}>
                      <Text style={styles.heroStatNum}>{upcomingEvents.length}</Text>
                      <Text style={styles.heroStatLabel}>Events</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.heroEmpty}
                onPress={() => router.push('/(app)/setlists/create')}
                activeOpacity={0.8}
              >
                <Ionicons name="musical-notes-outline" size={40} color={Colors.ink30} />
                <Text style={styles.heroEmptyTitle}>No upcoming service</Text>
                <Text style={styles.heroEmptySub}>
                  Create a set list to plan your next worship service
                </Text>
              </TouchableOpacity>
            )}

            {/* ── Your Availability ── */}
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>Your Availability</Text>
                <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/availability')}>
                  <Ionicons name="calendar-outline" size={20} color={Colors.p500} />
                </TouchableOpacity>
              </View>
              {myAvailability ? (
                <View style={styles.availRow}>
                  <Ionicons
                    name={availStatusCfg[myAvailability].icon}
                    size={28}
                    color={availStatusCfg[myAvailability].color}
                  />
                  <Text style={styles.availText}>{availStatusCfg[myAvailability].text}</Text>
                </View>
              ) : nextService ? (
                <TouchableOpacity
                  style={styles.availPrompt}
                  onPress={() => router.push('/(app)/(tabs)/availability')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="help-circle-outline" size={28} color={Colors.ink30} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.availPromptTitle}>Haven't responded yet</Text>
                    <Text style={styles.availPromptSub}>Tap to confirm your attendance</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.ink30} />
                </TouchableOpacity>
              ) : (
                <View style={styles.availRow}>
                  <Ionicons name="checkmark-circle" size={28} color={Colors.ink30} />
                  <Text style={styles.availText}>No upcoming services scheduled.</Text>
                </View>
              )}
            </View>

            {/* ── Upcoming Rehearsals ── */}
            {upcomingEvents.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>Upcoming Events</Text>
                  {isAdmin && (
                    <TouchableOpacity onPress={() => router.push('/(app)/rehearsals/create')}>
                      <Ionicons name="add-circle-outline" size={22} color={Colors.p500} />
                    </TouchableOpacity>
                  )}
                </View>
                {upcomingEvents.slice(0, 3).map((ev, i, arr) => (
                  <React.Fragment key={ev.id}>
                    <TouchableOpacity
                      style={styles.eventRow}
                      onPress={() => router.push(`/(app)/rehearsals/${ev.id}`)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.eventIcon}>
                        <Ionicons
                          name={EVENT_TYPE_ICON[ev.type] ?? 'calendar-outline'}
                          size={18}
                          color={Colors.p700}
                        />
                      </View>
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventTitle}>{ev.title}</Text>
                        <Text style={styles.eventDate}>
                          {formatDate(ev.startTime)} · {formatTime(ev.startTime)}
                        </Text>
                        {ev.location ? (
                          <Text style={styles.eventLocation} numberOfLines={1}>
                            {ev.location}
                          </Text>
                        ) : null}
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={Colors.ink30} />
                    </TouchableOpacity>
                    {i < arr.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
              </View>
            )}

            {/* ── Quick Actions ── */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Quick Actions</Text>
              {[
                { iconName: 'list-outline'        as const, label: 'New Set List',  route: '/(app)/setlists/create', adminOnly: true  },
                { iconName: 'calendar-outline'    as const, label: 'New Event',     route: '/(app)/rehearsals/create', adminOnly: true },
                { iconName: 'musical-notes-outline' as const, label: 'Add Song',   route: '/(app)/songs/add',       adminOnly: true  },
                { iconName: 'person-add-outline'  as const, label: 'Invite Member', route: '/(app)/invite',         adminOnly: true  },
                { iconName: 'library-outline'     as const, label: 'Song Library',  route: '/(app)/songs',          adminOnly: false },
              ]
                .filter((a) => !a.adminOnly || isAdmin)
                .map((a, i, arr) => (
                  <React.Fragment key={a.label}>
                    <TouchableOpacity
                      style={styles.actionRow}
                      onPress={() => router.push(a.route as any)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.actionIcon}>
                        <Ionicons name={a.iconName} size={18} color={Colors.p700} />
                      </View>
                      <Text style={styles.actionLabel}>{a.label}</Text>
                      <Ionicons name="chevron-forward" size={18} color={Colors.ink30} />
                    </TouchableOpacity>
                    {i < arr.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
            </View>
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

  scroll: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 100 },

  greeting: { gap: 4 },
  greetingText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.8,
    color: Colors.ink,
  },
  greetingSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.ink70,
    lineHeight: 22,
  },

  hero: {
    borderRadius: 24,
    padding: Spacing.lg,
    shadowColor: Colors.p900,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 12,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  heroEyebrow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
  },
  heroBadge: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.white,
  },
  heroTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    color: Colors.white,
    lineHeight: 32,
    marginBottom: Spacing.sm,
  },
  heroDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.lg,
  },
  heroDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: Spacing.base,
  },
  heroStats: { flexDirection: 'row', gap: Spacing.xl },
  heroStat:  { gap: 2 },
  heroStatNum: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: Colors.white,
  },
  heroStatLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
  },

  heroEmpty: {
    borderRadius: 24,
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.ink10,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroEmptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 17, color: Colors.ink },
  heroEmptySub:   {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.ink50,
    textAlign: 'center',
    lineHeight: 20,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(201,196,211,0.3)',
    gap: Spacing.sm,
    shadowColor: Colors.p900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.p900,
    marginBottom: 4,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Availability
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  availText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.ink,
    flex: 1,
    lineHeight: 20,
  },
  availPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  availPromptTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.ink },
  availPromptSub:   { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.ink50 },

  // Events
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  eventIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceMid,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  eventInfo:     { flex: 1, gap: 2 },
  eventTitle:    { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.ink },
  eventDate:     { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.ink50 },
  eventLocation: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.ink70 },

  // Quick Actions
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  actionIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceMid,
    alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.ink,
  },
  divider: { height: 1, backgroundColor: Colors.ink10 },
});
