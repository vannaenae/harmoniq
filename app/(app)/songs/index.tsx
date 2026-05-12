import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../../store/authStore';
import { useSongStore } from '../../../store/songStore';
import { subscribeSongs } from '../../../services/songService';
import { EmptyState, ErrorState, SkeletonCard } from '../../../components/ui';
import { Colors, Gradients } from '../../../constants/colors';
import { Spacing, Radius } from '../../../constants/spacing';
import { Song, SongGenre } from '../../../types';

const GENRES: Array<SongGenre | 'All'> = [
  'All', 'Gospel', 'Contemporary', 'Hymn', 'Modern', 'Anthem', 'Other',
];

const GENRE_COLORS: Record<SongGenre, string> = {
  Gospel:       '#1a7a4a',
  Contemporary: Colors.p700,
  Hymn:         '#b45309',
  Modern:       Colors.p500,
  Anthem:       '#913d8c',
  Other:        Colors.ink50,
};

export default function SongLibraryScreen() {
  const router   = useRouter();
  const { user } = useAuthStore();
  const { songs, setSongs } = useSongStore();

  const [search, setSearch]       = useState('');
  const [genre, setGenre]         = useState<SongGenre | 'All'>('All');
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

  const filtered = songs.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.artist ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesGenre = genre === 'All' || s.genre === genre;
    return matchesSearch && matchesGenre;
  });

  const renderSong = ({ item, index }: { item: Song; index: number }) => {
    const initials = item.title.charAt(0).toUpperCase();
    const genreColor = item.genre ? GENRE_COLORS[item.genre] : Colors.ink50;
    return (
      <TouchableOpacity
        style={styles.songRow}
        onPress={() => router.push(`/(app)/songs/${item.id}`)}
        activeOpacity={0.75}
      >
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: index % 2 === 0 ? Colors.p800 : Colors.secondary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {/* Info */}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {item.artist ?? 'Unknown artist'}
          </Text>
        </View>

        {/* Meta */}
        <View style={styles.songMeta}>
          {item.key && (
            <View style={styles.keyBadge}>
              <Text style={styles.keyText}>{item.key}</Text>
            </View>
          )}
          {item.genre && (
            <View style={[styles.genreTag, { backgroundColor: genreColor + '18' }]}>
              <Text style={[styles.genreTagText, { color: genreColor }]}>{item.genre}</Text>
            </View>
          )}
        </View>

        <Ionicons name="chevron-forward" size={16} color={Colors.ink30} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Music Library</Text>
          {!isLoading && (
            <Text style={styles.headerSub}>
              {songs.length} song{songs.length !== 1 ? 's' : ''} in repertoire
            </Text>
          )}
        </View>
        {isAdmin ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/(app)/songs/add')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Gradients.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addBtnGradient}
            >
              <Ionicons name="add" size={18} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={Colors.ink50} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs or artists..."
          placeholderTextColor={Colors.ink30}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={16} color={Colors.ink30} />
          </TouchableOpacity>
        )}
      </View>

      {/* Genre filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {GENRES.map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.chip, genre === g && styles.chipActive]}
            onPress={() => setGenre(g)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, genre === g && styles.chipTextActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading */}
      {isLoading && (
        <View style={{ gap: Spacing.sm, padding: Spacing.lg, paddingTop: Spacing.sm }}>
          {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} height={72} />)}
        </View>
      )}

      {/* Error */}
      {!isLoading && hasError && <ErrorState fullScreen />}

      {/* Empty — no songs at all */}
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

      {/* Empty — no results for search/filter */}
      {!isLoading && !hasError && songs.length > 0 && filtered.length === 0 && (
        <EmptyState
          iconName="search-outline"
          title="No results"
          description={
            search
              ? `No songs found matching "${search}".`
              : `No ${genre} songs in library yet.`
          }
        />
      )}

      {/* Song list */}
      {!isLoading && !hasError && filtered.length > 0 && (
        <>
          {/* Count row */}
          <View style={styles.countRow}>
            <Text style={styles.countLabel}>LIBRARY CATALOG</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{filtered.length} Total</Text>
            </View>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderSong}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* FAB — always visible for admins */}
      {isAdmin && !isLoading && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/(app)/songs/add')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={Gradients.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={26} color={Colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ink10,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceMid,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.ink50,
    marginTop: 1,
  },
  addBtn: { borderRadius: 18, overflow: 'hidden' },
  addBtnGradient: {
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
  },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.ink10,
    paddingHorizontal: Spacing.base,
    height: 46,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.ink,
  },

  // Genre chips
  chipRow: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.base,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.ink10,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    backgroundColor: Colors.p800,
    borderColor: Colors.p800,
  },
  chipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.ink50,
  },
  chipTextActive: { color: Colors.white },

  // Count row
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  countLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.ink50,
    textTransform: 'uppercase',
  },
  countBadge: {
    backgroundColor: Colors.surfaceMid,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: Colors.ink70,
  },

  // Song rows
  list: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, paddingBottom: 100 },
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
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    color: Colors.white,
  },
  songInfo: { flex: 1 },
  songTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.ink,
    marginBottom: 2,
  },
  songArtist: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.ink50,
  },
  songMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  keyBadge: {
    backgroundColor: Colors.p100,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  keyText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: Colors.p700,
    letterSpacing: 0.3,
  },
  genreTag: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  genreTagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.3,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 32,
    right: Spacing.lg,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: Colors.p900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    width: 56, height: 56,
    alignItems: 'center', justifyContent: 'center',
  },
});
