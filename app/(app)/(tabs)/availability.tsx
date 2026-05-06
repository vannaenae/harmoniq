import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../../store/authStore';
import { useSetListStore } from '../../../store/setListStore';
import { subscribeSetLists } from '../../../services/setListService';
import {
  doc, setDoc, getDoc, collection,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { EmptyState, ErrorState, SkeletonCard } from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Spacing, Radius } from '../../../constants/spacing';
import { SetList } from '../../../types';
import { formatDate } from '../../../lib/utils';

type Status = 'available' | 'unavailable' | 'maybe';

export default function AvailabilityScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setLists, setSetLists } = useSetListStore();

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError]   = useState(false);
  const [responses, setResponses] = useState<Record<string, Status>>({});
  const [saving, setSaving]       = useState<string | null>(null);

  const choirId = user?.choirId;

  useEffect(() => {
    if (!choirId) return;
    try {
      const unsub = subscribeSetLists(choirId, (data) => {
        setSetLists(data);
        setIsLoading(false);
      });
      return unsub;
    } catch {
      setHasError(true);
      setIsLoading(false);
    }
  }, [choirId]);

  const handleRespond = async (setListId: string, status: Status) => {
    if (!user?.uid || !choirId) return;
    setResponses(prev => ({ ...prev, [setListId]: status }));
    setSaving(setListId);
    try {
      await setDoc(
        doc(db, 'choirs', choirId, 'availability', `${setListId}_${user.uid}`),
        { setListId, userId: user.uid, status, updatedAt: new Date().toISOString() },
        { merge: true },
      );
    } finally {
      setSaving(null);
    }
  };

  const now     = new Date();
  const upcoming = setLists.filter(sl => new Date(sl.serviceDate) >= now);
  const next     = upcoming[0] ?? null;
  const rest     = upcoming.slice(1);

  const statusConfig = {
    available:   { label: 'Available',   color: Colors.success,  bg: Colors.successBg  },
    unavailable: { label: 'Unavailable', color: Colors.error,    bg: Colors.errorBg    },
    maybe:       { label: 'Pending',     color: Colors.warning,  bg: Colors.warningBg  },
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top nav */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(app)/choir-settings')}>
          <Text style={styles.navIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.navLogo}>Harmoniq</Text>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(app)/announcements')}>
          <Text style={styles.navIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Page heading */}
        <Text style={styles.pageTitle}>Your Availability</Text>
        <Text style={styles.pageSub}>
          Confirm your attendance for upcoming services to help the team coordinate vocals and scheduling.
        </Text>

        {isLoading && (
          <View style={{ gap: Spacing.base }}>
            <SkeletonCard height={200} />
            <SkeletonCard height={100} lines={2} />
            <SkeletonCard height={100} lines={2} />
          </View>
        )}

        {!isLoading && hasError && <ErrorState fullScreen />}

        {!isLoading && !hasError && setLists.length === 0 && (
          <EmptyState
            icon="📅"
            title="No services scheduled"
            description="Your director has not scheduled any upcoming services yet."
          />
        )}

        {!isLoading && !hasError && next && (
          <>
            {/* Next service card */}
            <LinearGradient
              colors={['#18005F', '#560056']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextCard}
            >
              <Text style={styles.nextEyebrow}>✦ NEXT SERVICE</Text>
              <Text style={styles.nextTitle}>{next.title}</Text>
              <Text style={styles.nextDate}>📅  {formatDate(next.serviceDate)}</Text>

              <TouchableOpacity
                style={[
                  styles.markBtn,
                  responses[next.id] === 'available' && styles.markBtnActive,
                ]}
                onPress={() => handleRespond(next.id, 'available')}
                activeOpacity={0.8}
              >
                <Text style={[styles.markBtnText, responses[next.id] === 'available' && { color: Colors.p900 }]}>
                  {responses[next.id] === 'available' ? '✓ Marked Available' : 'Mark Available'}
                </Text>
              </TouchableOpacity>

              <View style={styles.altBtns}>
                <TouchableOpacity
                  style={[styles.altBtn, responses[next.id] === 'maybe' && styles.altBtnMaybe]}
                  onPress={() => handleRespond(next.id, 'maybe')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.altBtnText}>⚠ Not Sure</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.altBtn, responses[next.id] === 'unavailable' && styles.altBtnUnavail]}
                  onPress={() => handleRespond(next.id, 'unavailable')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.altBtnText}>✕ Unavailable</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Upcoming schedule */}
            {rest.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
                {rest.map(sl => {
                  const resp = responses[sl.id];
                  const cfg  = resp ? statusConfig[resp] : null;
                  return (
                    <View key={sl.id} style={styles.scheduleCard}>
                      <View style={styles.scheduleLeft}>
                        <Text style={styles.scheduleIcon}>📅</Text>
                      </View>
                      <View style={styles.scheduleInfo}>
                        <Text style={styles.scheduleTitle}>{sl.title}</Text>
                        <Text style={styles.scheduleDate}>{formatDate(sl.serviceDate)}</Text>
                        <TouchableOpacity onPress={() => handleRespond(sl.id, resp === 'available' ? 'maybe' : 'available')}>
                          <Text style={styles.scheduleAction}>
                            {resp === 'available' ? 'Edit Response' : 'Respond Now'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {cfg && (
                        <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                          <Text style={[styles.statusPillText, { color: cfg.color }]}>{cfg.label}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </>
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
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(94,82,166,0.08)',
  },
  navBtn:  { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 20, color: Colors.p900 },
  navLogo: {
    fontFamily: 'Inter_900Black',
    fontSize: 20,
    fontStyle: 'italic',
    letterSpacing: -0.8,
    color: Colors.p900,
  },

  scroll: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 100 },

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
    lineHeight: 22,
    marginTop: -Spacing.sm,
  },

  nextCard: {
    borderRadius: 24,
    padding: Spacing.lg,
    gap: Spacing.base,
    shadowColor: Colors.p900,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  nextEyebrow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
  },
  nextTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: Colors.white,
    lineHeight: 30,
  },
  nextDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.xs,
  },

  markBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  markBtnActive: {
    backgroundColor: Colors.white,
  },
  markBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.white,
  },

  altBtns: { flexDirection: 'row', gap: Spacing.sm },
  altBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  altBtnMaybe:   { backgroundColor: 'rgba(217,119,6,0.3)',  borderColor: Colors.warning },
  altBtnUnavail: { backgroundColor: 'rgba(186,26,26,0.3)',  borderColor: Colors.error   },
  altBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.white,
  },

  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.ink,
    marginTop: Spacing.sm,
  },

  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.ink10,
    gap: Spacing.base,
  },
  scheduleLeft:   { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceMid, alignItems: 'center', justifyContent: 'center' },
  scheduleIcon:   { fontSize: 18 },
  scheduleInfo:   { flex: 1, gap: 2 },
  scheduleTitle:  { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.ink },
  scheduleDate:   { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.ink50 },
  scheduleAction: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.p500, marginTop: 4 },

  statusPill:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusPillText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
});
