import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import {
  collection, query, where, onSnapshot, doc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../store/authStore';
import { db } from '../../../lib/firebase';
import { Card, EmptyState, ErrorState, SkeletonCard } from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Spacing, Radius } from '../../../constants/spacing';
import { AvailabilityStatus, SetList } from '../../../types';
import { formatDate } from '../../../lib/utils';

const STATUS_OPTIONS: Array<{
  value: AvailabilityStatus;
  emoji: string;
  label: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
}> = [
  {
    value: 'available',
    emoji: '✓',
    label: 'Available',
    activeBg: '#DCFCE7',
    activeBorder: '#16A34A',
    activeText: '#16A34A',
  },
  {
    value: 'unavailable',
    emoji: '✕',
    label: 'Unavailable',
    activeBg: '#FFF1F2',
    activeBorder: '#E11D48',
    activeText: '#E11D48',
  },
  {
    value: 'maybe',
    emoji: '?',
    label: 'Not sure',
    activeBg: '#FEF3C7',
    activeBorder: '#D97706',
    activeText: '#D97706',
  },
];

export default function AvailabilityScreen() {
  const { user } = useAuthStore();
  const choirId = user?.choirId;
  const userId  = user?.uid;

  const [setLists, setSetLists]       = useState<SetList[]>([]);
  const [myAvailability, setMyAvail]  = useState<Record<string, AvailabilityStatus>>({});
  const [saving, setSaving]           = useState<string | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [hasError, setHasError]       = useState(false);

  useEffect(() => {
    if (!choirId) return;
    try {
      const q = query(
        collection(db, 'choirs', choirId, 'setlists'),
        where('status', '==', 'published')
      );
      const unsub = onSnapshot(q, (snap) => {
        const lists = snap.docs.map((d) => {
          const data = d.data();
          return {
            ...data, id: d.id,
            serviceDate: data.serviceDate?.toDate?.() ?? new Date(),
            createdAt:   data.createdAt?.toDate?.()   ?? new Date(),
            updatedAt:   data.updatedAt?.toDate?.()   ?? new Date(),
          } as SetList;
        });
        setSetLists(lists.sort((a, b) => +a.serviceDate - +b.serviceDate));
        setIsLoading(false);
      }, () => { setHasError(true); setIsLoading(false); });
      return unsub;
    } catch {
      setHasError(true);
      setIsLoading(false);
    }
  }, [choirId]);

  useEffect(() => {
    if (!choirId || !userId) return;
    const q = query(
      collection(db, 'choirs', choirId, 'availability'),
      where('userId', '==', userId)
    );
    return onSnapshot(q, (snap) => {
      const map: Record<string, AvailabilityStatus> = {};
      snap.docs.forEach((d) => { const data = d.data(); map[data.eventId] = data.status; });
      setMyAvail(map);
    });
  }, [choirId, userId]);

  const setStatus = async (setListId: string, status: AvailabilityStatus) => {
    if (!choirId || !userId || saving) return;
    setSaving(setListId);
    const id = `${userId}_${setListId}`;
    await setDoc(doc(db, 'choirs', choirId, 'availability', id), {
      choirId, eventId: setListId, userId, status,
      updatedAt: serverTimestamp(),
    });
    setSaving(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>Harmoniq</Text>
      </View>

      {/* Page heading */}
      <View style={styles.pageHead}>
        <Text style={styles.pageTitle}>Availability</Text>
        <Text style={styles.pageSub}>Let your director know when you're free.</Text>
      </View>

      {isLoading && (
        <View style={styles.skeleton}>
          <SkeletonCard height={160} />
          <SkeletonCard height={160} />
        </View>
      )}

      {!isLoading && hasError && <ErrorState fullScreen />}

      {!isLoading && !hasError && setLists.length === 0 && (
        <EmptyState
          icon="📅"
          title="No upcoming services"
          description="When your director publishes a set list, you'll be able to mark your availability here."
        />
      )}

      {!isLoading && !hasError && setLists.length > 0 && (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {setLists.map((sl) => {
            const current = myAvailability[sl.id] ?? 'no_response';
            const isSaving = saving === sl.id;

            return (
              <View key={sl.id} style={styles.card}>
                {/* Service info */}
                <Text style={styles.cardEyebrow}>UPCOMING SERVICE</Text>
                <Text style={styles.cardTitle}>{sl.title}</Text>
                <Text style={styles.cardDate}>{formatDate(sl.serviceDate)}</Text>

                {/* 3-column status buttons */}
                <View style={styles.btnGrid}>
                  {STATUS_OPTIONS.map((opt) => {
                    const isActive = current === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[
                          styles.statusBtn,
                          isActive && {
                            backgroundColor: opt.activeBg,
                            borderColor: opt.activeBorder,
                            borderWidth: 2,
                          },
                        ]}
                        onPress={() => !isSaving && setStatus(sl.id, opt.value)}
                        disabled={isSaving}
                        activeOpacity={0.75}
                      >
                        <Text style={[
                          styles.statusEmoji,
                          isActive && { color: opt.activeText },
                        ]}>
                          {opt.emoji}
                        </Text>
                        <Text style={[
                          styles.statusLabel,
                          isActive && { color: opt.activeText, fontFamily: 'Inter_600SemiBold' },
                        ]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Note about current status */}
                {current !== 'no_response' && (
                  <View style={styles.currentStatus}>
                    <Text style={styles.currentStatusText}>
                      {current === 'available' ? '✓ You marked yourself as available' :
                       current === 'unavailable' ? '✕ You marked yourself as unavailable' :
                       '? You are not sure yet'}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },

  topBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(24,0,95,0.05)',
  },
  logo: {
    fontFamily: 'Inter_900Black',
    fontSize: 20,
    fontStyle: 'italic',
    letterSpacing: -0.8,
    color: Colors.p900,
  },

  pageHead: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
    gap: Spacing.xs,
  },
  pageTitle: { ...Typography.headlineXL, color: Colors.ink },
  pageSub: { ...Typography.bodyMD, color: Colors.ink50 },

  skeleton: { padding: Spacing.lg, gap: Spacing.base },

  scroll: { padding: Spacing.lg, gap: Spacing.base, paddingBottom: 100 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.ink10,
    padding: Spacing.lg,
    gap: Spacing.sm,
    // Ambient shadow
    shadowColor: '#18005F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  cardEyebrow: {
    ...Typography.caption,
    color: Colors.p600,
    letterSpacing: 1.5,
  },
  cardTitle: { ...Typography.headlineLG, color: Colors.ink },
  cardDate: { ...Typography.body, color: Colors.ink50 },

  btnGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  statusBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.ink10,
    backgroundColor: Colors.surfaceLow,
    gap: 4,
  },
  statusEmoji: {
    fontSize: 22,
    color: Colors.ink50,
    fontFamily: 'Inter_700Bold',
  },
  statusLabel: {
    ...Typography.labelMD,
    color: Colors.ink50,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  currentStatus: {
    backgroundColor: Colors.surfaceMid,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  currentStatusText: { ...Typography.label, color: Colors.ink70, textAlign: 'center' },
});
