import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../store/authStore';
import { useSongStore } from '../../../store/songStore';
import { subscribeSongs } from '../../../services/songService';
import {
  Button, EmptyState, ErrorState, ScreenHeader, SkeletonCard,
} from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Spacing, Radius } from '../../../constants/spacing';
import { Song } from '../../../types';

export default function SongLibraryScreen() {
  const router  = useRouter();
  const { user } = useAuthStore();
  const { songs, setSongs } = useSongStore();

  const [search, setSearch]     = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError]   = useState(false);

  const choirId = user?.choirId;
  const isAdmin = user?.role === 'owner' || user?.role === 'leader';

  useEffect(() => {
    if (!choirId) return;
    setHasError(false);
    try {
      const unsub = subscribeSongs(choirId, (data) => {
        setSongs(data);
        setIsLoading(false);
      });
      return unsub;
    } catch {
      setHasError(true);
      setIsLoading(false);
    }
  }, [choirId]);

  const filtered = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.artist ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const renderSong = ({ item }: { item: Song }) => (
    <TouchableOpacity
      style={styles.songRow}
      onPress={() => router.push(`/(app)/songs/${item.id}`)}
    >
      <View style={styles.songIcon}>
        <Ionicons name="musical-notes-outline" size={18} color={Colors.p700} />
      </View>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        {item.artist && (
          <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
        )}
      </View>
      <View style={styles.songMeta}>
        {item.key && (
          <View style={styles.keyBadge}>
            <Text style={styles.keyText}>{item.key}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color={Colors.ink30} />
      </View>
    </TouchableOpacity>
  );

  const renderSkeleton = () => (
    <View style={{ gap: Spacing.sm, padding: Spacing.lg }}>
      {[140, 90, 110, 90, 140].map((h, i) => (
        <SkeletonCard key={i} height={h} lines={2} />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Song Library"
        subtitle={isLoading ? '' : `${songs.length} song${songs.length !== 1 ? 's' : ''}`}
        showBack
        rightElement={
          isAdmin ? (
            <Button label="+ Add" onPress={() => router.push('/(app)/songs/add')} size="sm" />
          ) : undefined
        }
      />

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={Colors.ink50} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs or artists..."
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

      {/* States */}
      {isLoading && renderSkeleton()}

      {!isLoading && hasError && (
        <ErrorState
          fullScreen
          onRetry={() => {
            setIsLoading(true);
            setHasError(false);
          }}
        />
      )}

      {!isLoading && !hasError && songs.length === 0 && (
        <EmptyState
          iconName="musical-notes-outline"
          title="No songs in library"
          description={
            isAdmin
              ? 'Add your first song to start building your repertoire.'
              : "Your director hasn't added any songs yet."
          }
          actionLabel={isAdmin ? 'Add Song' : undefined}
          onAction={isAdmin ? () => router.push('/(app)/songs/add') : undefined}
        />
      )}

      {!isLoading && !hasError && songs.length > 0 && filtered.length === 0 && (
        <EmptyState
          iconName="search-outline"
          title="No results"
          description={`No songs found matching "${search}".`}
        />
      )}

      {!isLoading && !hasError && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderSong}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.ink10,
    paddingHorizontal: Spacing.base,
    height: 48,
    gap: Spacing.sm,
  },
  searchInput: { flex: 1, ...Typography.body, color: Colors.ink },
  list: { padding: Spacing.lg, gap: Spacing.sm, paddingTop: Spacing.sm, paddingBottom: 24 },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.ink10,
    padding: Spacing.base,
    gap: Spacing.base,
  },
  songIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.p50,
    alignItems: 'center', justifyContent: 'center',
  },
  songInfo: { flex: 1 },
  songTitle: { ...Typography.bodyMed, color: Colors.ink },
  songArtist: { ...Typography.label, color: Colors.ink50 },
  songMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  keyBadge: {
    backgroundColor: Colors.p50, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  keyText: { ...Typography.micro, color: Colors.p700, letterSpacing: 0.5 },
});
