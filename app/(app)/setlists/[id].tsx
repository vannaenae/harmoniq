import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { deleteSetList, updateSetList } from '../../../services/setListService';
import { useSongStore } from '../../../store/songStore';
import { subscribeSongs } from '../../../services/songService';
import { useAuthStore } from '../../../store/authStore';
import { Card, HeroCard, LoadingState, Pill, ScreenHeader, Button } from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Spacing, Radius } from '../../../constants/spacing';
import { SetList, SetListSong, Song } from '../../../types';
import { formatDate, formatShortDate } from '../../../lib/utils';

export default function SetListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { songs, setSongs } = useSongStore();

  const [setList, setSetList] = useState<SetList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddSong, setShowAddSong] = useState(false);

  const isAdmin = user?.role === 'owner' || user?.role === 'leader';
  const choirId = user?.choirId;

  useEffect(() => {
    if (!choirId || !id) return;
    const unsub = onSnapshot(doc(db, 'choirs', choirId, 'setlists', id), (snap) => {
      if (!snap.exists()) { setIsLoading(false); return; }
      const d = snap.data();
      setSetList({
        ...d, id: snap.id,
        serviceDate: d.serviceDate?.toDate?.() ?? new Date(),
        createdAt:   d.createdAt?.toDate?.()   ?? new Date(),
        updatedAt:   d.updatedAt?.toDate?.()   ?? new Date(),
      } as SetList);
      setIsLoading(false);
    });
    const unsub2 = subscribeSongs(choirId, setSongs);
    return () => { unsub(); unsub2(); };
  }, [choirId, id]);

  const toggleStatus = async () => {
    if (!choirId || !id || !setList) return;
    const next = setList.status === 'draft' ? 'published' : 'draft';
    await updateSetList(choirId, id, { status: next });
  };

  const handleDelete = () => {
    Alert.alert('Delete Set List', 'This action cannot be undone.', [
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

  const addSongToSetList = async (song: Song) => {
    if (!setList || !choirId || !id) return;
    const already = setList.songs.some((s) => s.songId === song.id);
    if (already) { setShowAddSong(false); return; }
    const newSong: SetListSong = {
      songId: song.id,
      title: song.title,
      artist: song.artist,
      order: setList.songs.length + 1,
      key: song.key,
    };
    await updateSetList(choirId, id, { songs: [...setList.songs, newSong] });
    setShowAddSong(false);
  };

  const removeSong = async (songId: string) => {
    if (!setList || !choirId || !id) return;
    const updated = setList.songs
      .filter((s) => s.songId !== songId)
      .map((s, i) => ({ ...s, order: i + 1 }));
    await updateSetList(choirId, id, { songs: updated });
  };

  if (isLoading) return <LoadingState fullScreen />;
  if (!setList) return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Set List" showBack />
      <Text style={styles.notFound}>Set list not found.</Text>
    </SafeAreaView>
  );

  const librarySongs = songs.filter((s) => !setList.songs.some((sl) => sl.songId === s.id));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={setList.title}
        showBack
        rightElement={
          isAdmin ? (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <HeroCard
          eyebrow="Service"
          badge={setList.status}
          title={setList.title}
          subtitle={formatDate(setList.serviceDate)}
          stats={[
            { label: 'Songs', value: setList.songs.length },
          ]}
        />

        {/* Status toggle */}
        {isAdmin && (
          <Button
            label={setList.status === 'draft' ? '✅ Publish Set List' : '📝 Move to Draft'}
            onPress={toggleStatus}
            variant={setList.status === 'draft' ? 'primary' : 'secondary'}
            fullWidth
          />
        )}

        {/* Notes */}
        {setList.notes && (
          <Card>
            <Text style={styles.sectionLabel}>SERVICE NOTES</Text>
            <Text style={styles.bodyText}>{setList.notes}</Text>
          </Card>
        )}

        {/* Songs */}
        <View style={styles.songsHeader}>
          <Text style={styles.sectionTitle}>Songs</Text>
          {isAdmin && (
            <TouchableOpacity onPress={() => setShowAddSong((v) => !v)}>
              <Text style={styles.addSongBtn}>{showAddSong ? 'Cancel' : '+ Add Song'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Song picker */}
        {showAddSong && (
          <Card>
            <Text style={styles.sectionLabel}>SONG LIBRARY</Text>
            {librarySongs.length === 0 ? (
              <Text style={styles.emptyText}>All songs already added, or no songs in library.</Text>
            ) : (
              librarySongs.map((song) => (
                <TouchableOpacity
                  key={song.id}
                  style={styles.songPickerRow}
                  onPress={() => addSongToSetList(song)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.songTitle}>{song.title}</Text>
                    {song.artist && <Text style={styles.songArtist}>{song.artist}</Text>}
                  </View>
                  <Text style={styles.addIcon}>＋</Text>
                </TouchableOpacity>
              ))
            )}
          </Card>
        )}

        {/* Set list songs */}
        {setList.songs.length === 0 ? (
          <Card style={styles.emptySongs}>
            <Text style={styles.emptyText}>No songs added yet</Text>
          </Card>
        ) : (
          <View style={styles.songsList}>
            {setList.songs.map((sl, i) => (
              <View key={sl.songId} style={styles.songRow}>
                <View style={styles.songNum}>
                  <Text style={styles.songNumText}>{i + 1}</Text>
                </View>
                <TouchableOpacity
                  style={styles.songInfo}
                  onPress={() => router.push(`/(app)/songs/${sl.songId}`)}
                >
                  <Text style={styles.songTitle}>{sl.title}</Text>
                  {sl.artist && <Text style={styles.songArtist}>{sl.artist}</Text>}
                  {sl.key && (
                    <View style={styles.keyBadge}>
                      <Text style={styles.keyText}>{sl.key}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {isAdmin && (
                  <TouchableOpacity onPress={() => removeSong(sl.songId)} hitSlop={8}>
                    <Text style={styles.removeIcon}>✕</Text>
                  </TouchableOpacity>
                )}
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
  scroll: { padding: Spacing.lg, gap: Spacing.base, paddingBottom: 32 },
  sectionLabel: {
    ...Typography.caption, color: Colors.ink50, letterSpacing: 1.5, marginBottom: Spacing.xs,
  },
  sectionTitle: { ...Typography.h3, color: Colors.ink },
  bodyText: { ...Typography.body, color: Colors.ink, lineHeight: 24 },
  songsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  addSongBtn: { ...Typography.bodyMed, color: Colors.p600 },
  songsList: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.ink10,
    overflow: 'hidden',
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ink05,
    gap: Spacing.sm,
  },
  songNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.p50,
    alignItems: 'center', justifyContent: 'center',
  },
  songNumText: { ...Typography.label, color: Colors.p800, fontWeight: '700' },
  songInfo: { flex: 1, gap: 2 },
  songTitle: { ...Typography.bodyMed, color: Colors.ink },
  songArtist: { ...Typography.label, color: Colors.ink50 },
  keyBadge: {
    backgroundColor: Colors.p50, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 2,
  },
  keyText: { ...Typography.micro, color: Colors.p700, letterSpacing: 0.5 },
  removeIcon: { fontSize: 14, color: Colors.ink30, padding: 4 },
  emptySongs: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyText: { ...Typography.body, color: Colors.ink50, textAlign: 'center' },
  songPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.ink05,
    gap: Spacing.sm,
  },
  addIcon: { fontSize: 20, color: Colors.p600 },
  deleteBtn: { paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  deleteText: { ...Typography.bodyMed, color: Colors.error },
  notFound: { ...Typography.body, color: Colors.ink50, textAlign: 'center', marginTop: Spacing.xl },
});
