import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useSetListStore } from '../../../store/setListStore';
import { subscribeSetLists } from '../../../services/setListService';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { EmptyState, ErrorState, SkeletonCard } from '../../../components/ui';
import { Colors, Gradients } from '../../../constants/colors';
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

  const now      = new Date();
  const upcoming = setLists.filter(sl => new Date(sl.serviceDate) >= now);
  const next     = upcoming[0] ?? null;
  const rest     = upcoming.slice(1);

  const statusLabel: Record<Status, { text: string; color: string; bg: string }> = {
    available:   { text: 'Available',   color: Colors.success, bg: Colors.successBg  },
    unavailable: { text: 'Unavailable', color: Colors.error,   bg: Colors.errorBg    },
    maybe:       { text: 'Pending',     color: Colors.warning, bg: Colors.warningBg  },
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Top nav */}
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
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.pageTitle}>Your Availability</Text>
        <Text style={styles.pageSub}>
          Confirm your attendance for upcoming services to help the team coordinate vocals and scheduling.
        </Text>

        {isLoading && (
          <View style={{ gap: Spacing.base }}>
            <SkeletonCard height={200} />
            <SkeletonCard height={90} lines={2} />
            <SkeletonCard height={90} lines={2} />
          </View>
        )}

        {!isLoading && hasError && <ErrorState fullScreen />}

        {!isLoading && !hasError && setLists.length === 0 && (
          <EmptyState
            iconName="calendar-outline"
            title="No services scheduled"
            description="Your director has not scheduled any upcoming services yet."
          />
        )}

        {!isLoading && !hasError && next && (
          <>
            {/* ── Next Service hero card ── */}
            <LinearGradient
              colors={Gradients.hero}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextCard}
            >
              <View style={styles.nextHeader}>
                <Ionicons name="star" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.nextEyebrow}>Next Service</Text>
              </View>

              <Text style={styles.nextTitle}>{next.title}</Text>

              <View style={styles.nextDateRow}>
                <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.7)" />
                <Text style={styles.nextDate}>{formatDate(next.serviceDate)}</Text>
              </View>

              {/* Mark Available */}
              <TouchableOpacity
                style={[
                  styles.markAvailBtn,
                  responses[next.id] === 'available' && styles.markAvailBtnActive,
                ]}
                onPress={() => handleRespond(next.id, 'available')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color={responses[next.id] === 'available' ? Colors.p900 : Colors.white}
                />
                <Text style={[
                  styles.markAvailText,
                  responses[next.id] === 'available' && { color: Colors.p900 },
                ]}>
                  {responses[next.id] === 'available' ? 'Marked Available' : 'Mark Available'}
                </Text>
              </TouchableOpacity>

              {/* Not Sure / Unavailable */}
              <View style={styles.altRow}>
                <TouchableOpacity
                  style={[
                    styles.altBtn,
                    responses[next.id] === 'maybe' && styles.altBtnMaybe,
                  ]}
                  onPress={() => handleRespond(next.id, 'maybe')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="help-outline" size={15} color={Colors.white} />
                  <Text style={styles.altBtnText}>Not Sure</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.altBtn,
                    responses[next.id] === 'unavailable' && styles.altBtnUnavail,
                  ]}
                  onPress={() => handleRespond(next.id, 'unavailable')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-outline" size={15} color={Colors.white} />
                  <Text style={styles.altBtnText}>Unavailable</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* ── Upcoming Schedule ── */}
            {rest.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
                {rest.map(sl => {
                  const resp = responses[sl.id] as Status | undefined;
                  const cfg  = resp ? statusLabel[resp] : null;
                  return (
                    <View key={sl.id} style={styles.scheduleCard}>
                      <View style={styles.scheduleIcon}>
                        <Ionicons name="calendar-outline" size={18} color={Colors.p700} />
                      </View>
                      <View style={styles.scheduleInfo}>
                        {cfg && (
                          <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.text}</Text>
                          </View>
                        )}
                        <Text style={styles.scheduleTitle}>{sl.title}</Text>
                        <Text style={styles.scheduleDate}>{formatDate(sl.serviceDate)}</Text>
                        <TouchableOpacity
                          onPress={() => handleRespond(sl.id, resp === 'available' ? 'maybe' : 'available')}
                        >
                          <Text style={styles.scheduleAction}>
                            {resp === 'available' ? 'Edit Response' : 'Respond Now'}
                          </Text>
                        </TouchableOpacity>
                      </View>
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
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 10,
  },
  nextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: -4,
  },
  nextEyebrow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.75)',
  },
  nextTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: Colors.white,
    lineHeight: 30,
  },
  nextDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  nextDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },

  markAvailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 13,
  },
  markAvailBtnActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  markAvailText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.white,
  },

  altRow: { flexDirection: 'row', gap: Spacing.sm },
  altBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 11,
  },
  altBtnMaybe:   { borderColor: Colors.warning,  backgroundColor: 'rgba(217,119,6,0.25)'  },
  altBtnUnavail: { borderColor: Colors.error,     backgroundColor: 'rgba(186,26,26,0.25)'  },
  altBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.white,
  },

  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.ink,
  },

  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.ink10,
    gap: Spacing.base,
  },
  scheduleIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceMid,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  scheduleInfo:   { flex: 1, gap: 4 },
  statusPill:     { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText:     { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  scheduleTitle:  { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.ink },
  scheduleDate:   { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.ink50 },
  scheduleAction: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.p500,
    marginTop: 2,
  },
});
