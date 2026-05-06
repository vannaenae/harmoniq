import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { deleteSong } from '../../../services/songService';
import { useAuthStore } from '../../../store/authStore';
import { Card, LoadingState, Pill, ScreenHeader } from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Spacing, Radius } from '../../../constants/spacing';
import { Song } from '../../../types';

export default function SongDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === 'owner' || user?.role === 'leader';

  useEffect(() => {
    if (!user?.choirId || !id) return;
    const unsub = onSnapshot(doc(db, 'choirs', user.choirId, 'songs', id), (snap) => {
      if (!snap.exists()) { setIsLoading(false); return; }
      const data = snap.data();
      setSong({
        ...data,
        id: snap.id,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
      } as Song);
      setIsLoading(false);
    });
    return unsub;
  }, [user?.choirId, id]);

  const handleDelete = () => {
    Alert.alert('Delete Song', 'Are you sure you want to remove this song?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          if (!user?.choirId || !id) return;
          await deleteSong(user.choirId, id);
          router.back();
        },
      },
    ]);
  };

  if (isLoading) return <LoadingState fullScreen />;
  if (!song) return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Song" showBack />
      <Text style={styles.notFound}>Song not found.</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={song.title}
        subtitle={song.artist}
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
        {/* Key info */}
        <View style={styles.metaRow}>
          {song.key && (
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>KEY</Text>
              <Text style={styles.badgeValue}>{song.key}</Text>
            </View>
          )}
          {song.tempo && (
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>BPM</Text>
              <Text style={styles.badgeValue}>{song.tempo}</Text>
            </View>
          )}
        </View>

        {/* Links */}
        {(song.youtubeUrl || song.spotifyUrl) && (
          <Card style={styles.linksCard}>
            <Text style={styles.sectionLabel}>LISTEN</Text>
            {song.youtubeUrl && (
              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => Linking.openURL(song.youtubeUrl!)}
              >
                <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                <Text style={styles.linkText}>Open on YouTube</Text>
                <Ionicons name="open-outline" size={16} color={Colors.ink30} />
              </TouchableOpacity>
            )}
            {song.spotifyUrl && (
              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => Linking.openURL(song.spotifyUrl!)}
              >
                <Ionicons name="musical-note-outline" size={20} color="#1DB954" />
                <Text style={styles.linkText}>Open on Spotify</Text>
                <Ionicons name="open-outline" size={16} color={Colors.ink30} />
              </TouchableOpacity>
            )}
          </Card>
        )}

        {/* Description */}
        {song.description && (
          <Card>
            <Text style={styles.sectionLabel}>DESCRIPTION</Text>
            <Text style={styles.bodyText}>{song.description}</Text>
          </Card>
        )}

        {/* Rehearsal notes */}
        {song.rehearsalNotes && (
          <Card>
            <Text style={styles.sectionLabel}>REHEARSAL NOTES</Text>
            <Text style={styles.bodyText}>{song.rehearsalNotes}</Text>
          </Card>
        )}

        {/* Lyrics */}
        {song.lyrics && (
          <Card>
            <Text style={styles.sectionLabel}>LYRICS</Text>
            <Text style={[styles.bodyText, styles.lyrics]}>{song.lyrics}</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { padding: Spacing.lg, gap: Spacing.base, paddingBottom: 32 },
  metaRow: { flexDirection: 'row', gap: Spacing.sm },
  badge: {
    backgroundColor: Colors.p50,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  badgeLabel: { ...Typography.micro, color: Colors.p600, letterSpacing: 1.5 },
  badgeValue: { ...Typography.h3, color: Colors.p900 },
  linksCard: { gap: Spacing.sm },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.ink50,
    letterSpacing: 1.5,
    marginBottom: Spacing.xs,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.ink05,
  },
  linkText: { ...Typography.bodyMed, color: Colors.p800, flex: 1 },
  bodyText: { ...Typography.body, color: Colors.ink, lineHeight: 24 },
  lyrics: { fontFamily: 'Inter_400Regular', lineHeight: 28 },
  deleteBtn: { paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  deleteText: { ...Typography.bodyMed, color: Colors.error },
  notFound: {
    ...Typography.body, color: Colors.ink50,
    textAlign: 'center', marginTop: Spacing.xl,
  },
});
