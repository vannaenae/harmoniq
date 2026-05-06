import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useSetListStore } from '../../../store/setListStore';
import { subscribeSetLists } from '../../../services/setListService';
import { EmptyState, ErrorState, SkeletonCard } from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Spacing } from '../../../constants/spacing';
import { SetList } from '../../../types';
import { formatDate } from '../../../lib/utils';

export default function SetListsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setLists, setSetLists } = useSetListStore();

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError]   = useState(false);

  const choirId = user?.choirId;
  const isAdmin = user?.role === 'owner' || user?.role === 'leader';

  useEffect(() => {
    if (!choirId) return;
    setHasError(false);
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

  const now = new Date();
  const upcoming = setLists.filter(sl => new Date(sl.serviceDate) >= now);
  const past     = setLists.filter(sl => new Date(sl.serviceDate) < now);

  const sections = [
    { title: 'Upcoming Services', data: upcoming },
    { title: 'Past Services',     data: past     },
  ].filter(s => s.data.length > 0);

  const renderItem = ({ item, section }: { item: SetList; section: { title: string } }) => {
    const isPast = section.title === 'Past Services';
    return (
      <TouchableOpacity
        style={[styles.row, isPast && styles.rowPast]}
        onPress={() => router.push(`/(app)/setlists/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.rowContent}>
          <View style={styles.rowLeft}>
            <View style={styles.rowTitleRow}>
              <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
              {!isPast && item.status === 'published' && (
                <View style={styles.pillPublished}><Text style={styles.pillPublishedText}>Published</Text></View>
              )}
              {!isPast && item.status === 'draft' && (
                <View style={styles.pillDraft}><Text style={styles.pillDraftText}>Draft</Text></View>
              )}
            </View>
            <Text style={styles.rowDate}>{formatDate(item.serviceDate)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.ink30} />
        </View>
        <View style={styles.rowDivider} />
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

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
        <View>
          <Text style={styles.pageTitle}>Set Lists</Text>
          <Text style={styles.pageSub}>Manage and review upcoming and past services.</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(app)/setlists/create')}>
            <Text style={styles.addBtnText}>+ New</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading && (
        <View style={{ padding: Spacing.lg, gap: Spacing.base }}>
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} height={64} lines={2} />)}
        </View>
      )}

      {!isLoading && hasError && (
        <ErrorState fullScreen onRetry={() => { setIsLoading(true); setHasError(false); }} />
      )}

      {!isLoading && !hasError && setLists.length === 0 && (
        <EmptyState
          iconName="list-outline"
          title="No set lists yet"
          description={isAdmin ? 'Create your first set list to plan your next service.' : 'Your director has not created any set lists yet.'}
          actionLabel={isAdmin ? 'Create Set List' : undefined}
          onAction={isAdmin ? () => router.push('/(app)/setlists/create') : undefined}
        />
      )}

      {!isLoading && !hasError && setLists.length > 0 && (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
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
    marginTop: 4,
    lineHeight: 20,
  },
  addBtn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.p900,
    marginTop: 6,
  },
  addBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.p900 },

  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },

  sectionHeader: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.ink,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },

  row:     { paddingVertical: 2 },
  rowPast: { opacity: 0.6 },

  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.base,
  },
  rowLeft:     { flex: 1, gap: 4 },
  rowTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  rowTitle:    { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: Colors.ink },
  rowDate:     { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.ink50 },
  rowChevron:  { paddingLeft: Spacing.sm },

  pillPublished: {
    backgroundColor: '#e9f5e9',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  pillPublishedText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#16A34A' },

  pillDraft: {
    backgroundColor: Colors.surfaceMid,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  pillDraftText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.ink50 },

  rowDivider: { height: 1, backgroundColor: 'rgba(55,0,91,0.06)' },
});
