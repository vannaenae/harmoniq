import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { subscribeMembers } from '../../../services/choirService';
import { EmptyState, ErrorState, SkeletonCard } from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Spacing, Radius } from '../../../constants/spacing';
import { ChoirMember } from '../../../types';
import { getInitials } from '../../../lib/utils';

const AVATAR_COLORS = ['#1a0360', '#913d8c', '#3D0080', '#5e52a6', '#7c2b79', '#463a8c'];

export default function MembersScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [members, setMembers]     = useState<ChoirMember[]>([]);
  const [search, setSearch]       = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError]   = useState(false);

  const choirId = user?.choirId;
  const isAdmin = user?.role === 'owner' || user?.role === 'leader';

  useEffect(() => {
    if (!choirId) return;
    setHasError(false);
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

  const filtered = members.filter(m =>
    m.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.vocalPart?.toLowerCase().includes(search.toLowerCase()),
  );

  const avatarColor = (name: string) =>
    AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

  const roleLabel = (role: string) => {
    if (role === 'owner' || role === 'leader') return 'Coordinator';
    return 'Member';
  };

  const vocalLabel = (part?: string) => {
    const map: Record<string, string> = {
      soprano: 'Soprano', alto: 'Alto', tenor: 'Tenor', bass: 'Bass',
      instrumentalist: 'Instrumentalist', unassigned: '',
    };
    return part ? (map[part] ?? part) : '';
  };

  const renderMember = ({ item }: { item: ChoirMember }) => {
    const initials = getInitials(item.displayName ?? item.email ?? '??');
    const bgColor  = avatarColor(item.displayName ?? '');
    const isCoord  = item.role === 'owner' || item.role === 'leader';
    const vocal    = vocalLabel(item.vocalPart);

    return (
      <TouchableOpacity
        style={styles.memberRow}
        onPress={() => router.push(`/(app)/members/${item.uid}`)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: bgColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.displayName ?? 'Unknown'}</Text>
          {vocal ? <Text style={styles.memberVocal}>{vocal}</Text> : null}
        </View>

        <View style={[styles.rolePill, isCoord && styles.rolePillCoord]}>
          <Text style={[styles.rolePillText, isCoord && styles.rolePillTextCoord]}>
            {roleLabel(item.role)}
          </Text>
        </View>
      </TouchableOpacity>
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
        <View style={styles.pageTitleRow}>
          <Text style={styles.pageTitle}>Members</Text>
          {isAdmin && (
            <TouchableOpacity style={styles.inviteBtn} onPress={() => router.push('/(app)/invite')}>
              <Text style={styles.inviteBtnText}>+ Invite Member</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={Colors.ink50} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search members, roles..."
            placeholderTextColor={Colors.ink30}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close" size={16} color={Colors.ink30} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && (
        <View style={{ padding: Spacing.lg, gap: Spacing.base }}>
          {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} height={64} lines={2} />)}
        </View>
      )}

      {!isLoading && hasError && <ErrorState fullScreen />}

      {!isLoading && !hasError && members.length === 0 && (
        <EmptyState
          iconName="people-outline"
          title="No members yet"
          description={isAdmin ? 'Invite your first member to get started.' : 'No members have joined yet.'}
          actionLabel={isAdmin ? 'Invite Member' : undefined}
          onAction={isAdmin ? () => router.push('/(app)/invite') : undefined}
        />
      )}

      {!isLoading && !hasError && members.length > 0 && filtered.length === 0 && (
        <EmptyState iconName="search-outline" title="No results" description={`No members found matching "${search}".`} />
      )}

      {!isLoading && !hasError && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={item => item.uid}
          renderItem={renderMember}
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
    gap: Spacing.base,
  },
  pageTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    letterSpacing: -0.8,
    color: Colors.ink,
  },
  inviteBtn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    backgroundColor: Colors.p900,
  },
  inviteBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.white },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.ink10,
    paddingHorizontal: Spacing.base,
    height: 48,
    gap: Spacing.sm,
  },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: Colors.ink },

  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    gap: Spacing.base,
    borderBottomWidth: 0,
  },

  avatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.white,
  },

  memberInfo:  { flex: 1, gap: 2 },
  memberName:  { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: Colors.ink },
  memberVocal: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.ink70 },

  rolePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: Colors.surfaceMid,
  },
  rolePillCoord: {
    backgroundColor: Colors.p50,
  },
  rolePillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
    color: Colors.ink50,
  },
  rolePillTextCoord: {
    color: Colors.p900,
  },
});
