import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../store/authStore';
import { useSetListStore } from '../../../store/setListStore';
import { subscribeSetLists } from '../../../services/setListService';
import { Button, EmptyState, ErrorState, Pill, SkeletonCard } from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Spacing, Radius } from '../../../constants/spacing';
import { SetList } from '../../../types';
import { formatShortDate } from '../../../lib/utils';

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

  const now      = new Date();
  const upcoming = setLists.filter((sl) => new Date(sl.serviceDate) >= now);
  const past     = setLists.filter((sl) => new Date(sl.serviceDate) <  now);

  const sections = [
    ...(upcoming.length > 0 ? [{ title: 'Upcoming', data: upcoming }] : []),
    ...(past.length > 0     ? [{ title: 'Past',     data: past     }] : []),
  ];

  const renderItem = ({ item, section }: { item: SetList; section: { title: string } }) => {
    const isPast = section.title === 'Past';
    return (
      <TouchableOpacity
        style={[styles.item, isPast && styles.itemPast]}
        onPress={() => router.push(`/(app)/setlists/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.itemLeft}>
          <View style={styles.itemTitleRow}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
            <Pill
              label={item.status}
              variant={item.status === 'published' ? 'published' : 'draft'}
            />
          </View>
          <Text style={styles.itemMeta}>
            {formatShortDate(item.serviceDate)}
            {item.songs.length > 0 && ` · ${item.songs.length} song${item.songs.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.logo}>Harmoniq</Text>
        </View>
        {isAdmin && (
          <Button label="+ New" onPress={() => router.push('/(app)/setlists/create')} size="sm" />
        )}
      </View>

      {/* Page heading */}
      <View style={styles.pageHead}>
        <Text style={styles.pageTitle}>Set Lists</Text>
        <Text style={styles.pageSub}>Manage and review upcoming and past services.</Text>
      </View>

      {/* Loading */}
      {isLoading && (
        <View style={styles.skeleton}>
          <SkeletonCard height={72} lines={2} />
          <SkeletonCard height={72} lines={2} />
          <SkeletonCard height={72} lines={2} />
        </View>
      )}

      {/* Error */}
      {!isLoading && hasError && (
        <ErrorState fullScreen onRetry={() => { setIsLoading(true); setHasError(false); }} />
      )}

      {/* Empty */}
      {!isLoading && !hasError && setLists.length === 0 && (
        <EmptyState
          icon="📋"
          title="No set lists yet"
          description="Create your first set list to plan upcoming worship services."
          actionLabel={isAdmin ? 'Create Set List' : undefined}
          onAction={isAdmin ? () => router.push('/(app)/setlists/create') : undefined}
        />
      )}

      {/* List */}
      {!isLoading && !hasError && setLists.length > 0 && (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
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
    paddingVertical: Spacing.base,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(24,0,95,0.05)',
  },
  topLeft: {},
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

  skeleton: { padding: Spacing.lg, gap: Spacing.sm },

  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },

  sectionHeader: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceHigh,
    marginBottom: Spacing.xs,
  },
  sectionTitle: { ...Typography.headlineLG, color: Colors.ink },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55,0,91,0.06)',
    gap: Spacing.sm,
  },
  itemPast: { opacity: 0.65 },
  itemLeft: { flex: 1, gap: 4 },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  itemTitle: { ...Typography.bodyLG, fontFamily: 'Inter_600SemiBold', color: Colors.ink, flex: 1 },
  itemMeta: { ...Typography.bodyMD, color: Colors.ink50 },
  chevron: { fontSize: 22, color: Colors.ink30 },
});
