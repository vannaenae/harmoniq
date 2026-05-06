import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../store/authStore';
import { useChoirStore } from '../../../store/choirStore';
import { subscribeMembers } from '../../../services/choirService';
import { Avatar, Button, EmptyState, ErrorState, Pill, SkeletonCard } from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Spacing, Radius } from '../../../constants/spacing';
import { ChoirMember } from '../../../types';
import { vocalPartLabel, roleLabel } from '../../../lib/utils';

export default function MembersScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { members, setMembers } = useChoirStore();

  const [search, setSearch]       = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError]   = useState(false);

  const choirId = user?.choirId;
  const isAdmin = user?.role === 'owner' || user?.role === 'leader';

  useEffect(() => {
    if (!choirId) return;
    try {
      const unsub = subscribeMembers(choirId, (data) => {
        setMembers(data);
        setIsLoading(false);
      });
      return unsub;
    } catch {
      setHasError(true);
      setIsLoading(false);
    }
  }, [choirId]);

  const filtered = members.filter(
    (m) =>
      m.displayName.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      vocalPartLabel[m.vocalPart]?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by vocal part
  const grouped = filtered.reduce<Record<string, ChoirMember[]>>((acc, m) => {
    const part = vocalPartLabel[m.vocalPart] ?? 'Unassigned';
    if (!acc[part]) acc[part] = [];
    acc[part].push(m);
    return acc;
  }, {});

  const renderMember = ({ item, index, total }: { item: ChoirMember; index: number; total: number }) => (
    <TouchableOpacity
      style={[styles.memberRow, index < total - 1 && styles.memberDivider]}
      onPress={() => router.push(`/(app)/members/${item.uid}`)}
      activeOpacity={0.7}
    >
      <Avatar name={item.displayName} photoURL={item.photoURL} size="md" />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.displayName}</Text>
        <Text style={styles.memberSub}>{item.email}</Text>
      </View>
      <View style={styles.memberRight}>
        <Pill
          label={item.role === 'owner' ? 'Owner' : item.role === 'leader' ? 'Leader' : 'Member'}
          variant={item.role}
        />
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>Harmoniq</Text>
        {isAdmin && (
          <Button label="Invite" onPress={() => router.push('/(app)/invite')} size="sm" />
        )}
      </View>

      {/* Page heading */}
      <View style={styles.pageHead}>
        <View style={styles.headRow}>
          <View>
            <Text style={styles.pageTitle}>Members</Text>
            <Text style={styles.pageSub}>
              {isLoading ? 'Loading…' : `${members.length} member${members.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search members, parts..."
            placeholderTextColor={Colors.ink30}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Loading */}
      {isLoading && (
        <View style={styles.skeleton}>
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} height={68} lines={2} />)}
        </View>
      )}

      {/* Error */}
      {!isLoading && hasError && <ErrorState fullScreen />}

      {/* Empty — no members */}
      {!isLoading && !hasError && members.length === 0 && (
        <EmptyState
          icon="👥"
          title="No members yet"
          description="Invite your choir members to get started."
          actionLabel={isAdmin ? 'Invite Members' : undefined}
          onAction={isAdmin ? () => router.push('/(app)/invite') : undefined}
        />
      )}

      {/* Empty — no search results */}
      {!isLoading && !hasError && members.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No results"
          description={`No members found for "${search}".`}
        />
      )}

      {/* Members list */}
      {!isLoading && !hasError && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(m) => m.uid}
          renderItem={({ item, index }) =>
            renderMember({ item, index, total: filtered.length })
          }
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
    paddingVertical: Spacing.base,
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
    gap: Spacing.base,
  },
  headRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  pageTitle: { ...Typography.headlineXL, color: Colors.ink },
  pageSub: { ...Typography.bodyMD, color: Colors.ink50 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.ink10,
    paddingHorizontal: Spacing.base,
    height: 44,
    gap: Spacing.sm,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, ...Typography.body, color: Colors.ink },
  clearBtn: { fontSize: 13, color: Colors.ink30, padding: 4 },

  skeleton: { padding: Spacing.lg, gap: Spacing.sm },

  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    gap: Spacing.base,
  },
  memberDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55,0,91,0.06)',
  },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { ...Typography.bodyLG, fontFamily: 'Inter_600SemiBold', color: Colors.ink },
  memberSub: { ...Typography.bodyMD, color: Colors.ink50 },
  memberRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  chevron: { fontSize: 20, color: Colors.ink30 },
});
