import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { deleteSetList, updateSetList } from '../../../services/setListService';
import { subscribeSongs } from '../../../services/songService';
import { useSongStore } from '../../../store/songStore';
import { useAuthStore } from '../../../store/authStore';
import { SkeletonCard, EmptyState } from '../../../components/ui';
import { Colors, Gradients } from '../../../constants/colors';
import { Spacing, Radius } from '../../../constants/spacing';
import { SetList, SetListSong, Song } from '../../../types';
import { formatDate } from '../../../lib/utils';

function toDateStr(v: unknown): string {
  if (!v) return new Date().toISOString();
  if (typeof v === 'string') return v;
  if (typeof (v as any).toDate === 'function') return (v as any).toDate().toISOString();
  return new Date().toISOString();
}

export default function SetListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const { user } = useAuthStore();
  const { songs, setSongs } = useSongStore();

  const [setList, setSetList]       = useState<SetList | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  const isAdmin = user?.role === 'owner' || user?.role === 'leader';
  const choirId = user?.choirId;

  useEffect(() => {
    if (!choirId || !id) return;
    const unsub1 = onSnapshot(doc(db, 'choirs', choirId, 'setlists', id), (snap) => {
      if (!snap.exists()) { setIsLoading(false); return; }
      const d = snap.data();
      setSetList({
        ...d, id: snap.id,
        serviceDate: toDateStr(d.serviceDate),
        createdAt:   toDateStr(d.createdAt),
      } as SetList);
      setIsLoading(false);
    });
    const unsub2 = subscribeSongs(choirId, setSongs);
    return () => { unsub1(); unsub2(); };
  }, [choirId, id]);

  const toggleStatus = async () => {
    if (!choirId || !id || !setList) return;
    const next = setList.status === 'draft' ? 'published' : 'draft';
    await updateSetList(choirId, id, { status: next });
  };

  const handleDelete = () => {
    Alert.alert('Delete Set List', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          if (!choirId || !id) return;
          await deleteSetList(choirId, id);
          router.back();
        },
      },
    ]);
  };

  const addSong = async (song: Song) => {
    if (!setList || !choirId || !id) return;
    if (setList.songs.some(s => s.songId === song.id)) { setShowPicker(false); return; }
    const newSong: SetListSong = {
      songId: song.id,
      title:  song.title,
      artist: song.artist,
      key:    song.key,
      order:  setList.songs.length + 1,
    };
    await updateSetList(choirId, id, { songs: [...setList.songs, newSong] });
    setShowPicker(false);
  };

  const removeSong = async (songId: string) => {
    if (!setList || !choirId || !id) return;
    const updated = setList.songs
      .filter(s => s.songId !== songId)
      .map((s, i) => ({ ...s, order: i + 1 }));
    await updateSetList(choirId, id, { songs: updated });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.p900} />
          </TouchableOpacity>
          <Text style={styles.navLogo}>Harmoniq</Text>
          <View style={styles.navBtn} />
        </View>
        <View style={{ padding: Spacing.lg, gap: Spacing.base }}>
          <SkeletonCard height={200} />
          <SkeletonCard height={80} lines={2} />
          <SkeletonCard height={80} lines={2} />
        </View>
      </SafeAreaView>
    );
  }

  if (!setList) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.p900} />
          </TouchableOpacity>
          <Text style={styles.navLogo}>Harmoniq</Text>
          <View style={styles.navBtn} />
        </View>
        <EmptyState iconName="list-outline" title="Set list not found" description="This set list may have been deleted." />
      </SafeAreaView>
    );
  }

  const librarySongs = songs.filter(s => !setList.songs.some(sl => sl.songId === s.id));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top nav */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.p900} />
        </TouchableOpacity>
        <Text style={styles.navLogo}>Harmoniq</Text>
        {isAdmin ? (
          <TouchableOpacity style={styles.navBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        ) : (
          <View style={styles.navBtn} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero card */}
        <LinearGradient
          colors={Gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <Text style={styles.heroEyebrow}>SERVICE</Text>
            <View style={[
              styles.statusBadge,
              setList.status === 'published' ? styles.statusPublished : styles.statusDraft,
            ]}>
              <Text style={styles.statusBadgeText}>
                {setList.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
              </Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{setList.title}</Text>

          <View style={styles.heroDateRow}>
            <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={styles.heroDate}>{formatDate(setList.serviceDate)}</Text>
          </View>

          {setList.serviceTime ? (
            <View style={styles.heroDateRow}>
              <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.7)" />
              <Text style={styles.heroDate}>{setList.serviceTime}</Text>
            </View>
          ) : null}

          <View style={styles.heroDivider} />

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{setList.songs.length}</Text>
              <Text style={styles.heroStatLabel}>Songs</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Admin: status toggle + edit */}
        {isAdmin && (
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              setList.status === 'draft' ? styles.togglePublish : styles.toggleDraft,
            ]}
            onPress={toggleStatus}
            activeOpacity={0.8}
          >
            <Ionicons
              name={setList.status === 'draft' ? 'cloud-upload-outline' : 'document-outline'}
              size={18}
              color={setList.status === 'draft' ? Colors.white : Colors.ink70}
            />
            <Text style={[
              styles.toggleBtnText,
              setList.status === 'draft' ? { color: Colors.white } : { color: Colors.ink70 },
            ]}>
              {setList.status === 'draft' ? 'Publish Set List' : 'Move to Draft'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Service notes */}
        {setList.notes ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>SERVICE NOTES</Text>
            <Text style={styles.notesText}>{setList.notes}</Text>
          </View>
        ) : null}

        {/* Songs section */}
        <View style={styles.songsSectionHeader}>
          <View style={styles.songsTitleRow}>
            <Text style={styles.songsTitle}>Repertoire</Text>
            <View style={styles.songCountBadge}>
              <Text style={styles.songCountText}>{setList.songs.length} Songs</Text>
            </View>
          </View>
          {isAdmin && (
            <TouchableOpacity onPress={() => setShowPicker(p => !p)}>
              <Text style={styles.addSongLink}>
                {showPicker ? 'Cancel' : '+ Add Song'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Song picker */}
        {showPicker && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>SONG LIBRARY</Text>
            {librarySongs.length === 0 ? (
              <Text style={styles.emptyPickerText}>All songs already added.</Text>
            ) : (
              librarySongs.map(song => (
                <TouchableOpacity
                  key={song.id}
                  style={styles.pickerRow}
                  onPress={() => addSong(song)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickerTitle}>{song.title}</Text>
                    {song.artist ? <Text style={styles.pickerArtist}>{song.artist}</Text> : null}
                  </View>
                  <Ionicons name="add-circle-outline" size={22} color={Colors.p500} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Song list */}
        {setList.songs.length === 0 ? (
          <View style={[styles.card, { alignItems: 'center', paddingVertical: Spacing.xl }]}>
            <Ionicons name="musical-notes-outline" size={32} color={Colors.ink30} />
            <Text style={styles.emptyPickerText}>No songs added yet</Text>
            {isAdmin && (
              <TouchableOpacity onPress={() => setShowPicker(true)}>
                <Text style={styles.addSongLink}>+ Add from library</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.songsList}>
            {setList.songs.map((sl, i) => (
              <View key={sl.songId} style={[styles.songRow, i > 0 && styles.songRowBorder]}>
                <View style={styles.songNum}>
                  <Text style={styles.songNumText}>{String(i + 1).padStart(2, '0')}</Text>
                </View>
                <TouchableOpacity
                  style={styles.songInfo}
                  onPress={() => router.push(`/(app)/songs/${sl.songId}`)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.songTitle}>{sl.title}</Text>
                  {sl.artist ? <Text style={styles.songArtist}>{sl.artist}</Text> : null}
                  {sl.key ? (
                    <View style={styles.keyBadge}>
                      <Text style={styles.keyText}>Key: {sl.key}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
                <View style={styles.songActions}>
                  <TouchableOpacity onPress={() => router.push(`/(app)/songs/${sl.songId}`)}>
                    <Ionicons name="headset-outline" size={18} color={Colors.ink50} />
                  </TouchableOpacity>
                  {isAdmin && (
                    <TouchableOpacity onPress={() => removeSong(sl.songId)} hitSlop={8}>
                      <Ionicons name="close" size={18} color={Colors.ink30} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
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

  scroll: { padding: Spacing.lg, gap: Spacing.base, paddingBottom: 60 },

  // Hero
  heroCard: {
    borderRadius: 24,
    padding: Spacing.lg,
    shadowColor: Colors.p900,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 10,
    gap: Spacing.sm,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroEyebrow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.7)',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  statusPublished: {
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  statusDraft: {
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  statusBadgeText: {
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
  },
  heroDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: Spacing.xs,
  },
  heroStats:    { flexDirection: 'row', gap: Spacing.xl },
  heroStat:     { gap: 2 },
  heroStatNum:  { fontFamily: 'Inter_700Bold', fontSize: 24, color: Colors.white },
  heroStatLabel:{ fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.65)' },

  // Toggle button
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: Radius.full,
  },
  togglePublish: { backgroundColor: Colors.p800 },
  toggleDraft:   { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.ink10 },
  toggleBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },

  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.ink10,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.ink50,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  notesText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.ink70,
    lineHeight: 22,
  },

  // Songs section
  songsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  songsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  songsTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.ink,
  },
  songCountBadge: {
    backgroundColor: Colors.surfaceMid,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  songCountText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: Colors.p700,
  },
  addSongLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.p500,
  },

  // Song list
  songsList: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.ink10,
    overflow: 'hidden',
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.base,
  },
  songRowBorder: { borderTopWidth: 1, borderTopColor: Colors.ink10 },
  songNum: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.p50,
    alignItems: 'center', justifyContent: 'center',
  },
  songNumText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: Colors.p800,
    letterSpacing: 0.5,
  },
  songInfo: { flex: 1, gap: 2 },
  songTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.ink,
  },
  songArtist: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.ink50,
  },
  keyBadge: {
    backgroundColor: Colors.p50,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  keyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: Colors.p700,
  },
  songActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },

  // Picker
  emptyPickerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.ink50,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.ink10,
    gap: Spacing.sm,
  },
  pickerTitle:  { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.ink },
  pickerArtist: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.ink50 },
});
