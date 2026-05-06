import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addSong } from '../../../services/songService';
import { useAuthStore } from '../../../store/authStore';
import { Button, Input, ScreenHeader } from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Spacing } from '../../../constants/spacing';

export default function AddSongScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [title, setTitle]               = useState('');
  const [artist, setArtist]             = useState('');
  const [key, setKey]                   = useState('');
  const [youtubeUrl, setYoutubeUrl]     = useState('');
  const [spotifyUrl, setSpotifyUrl]     = useState('');
  const [description, setDescription]   = useState('');
  const [lyrics, setLyrics]             = useState('');
  const [rehearsalNotes, setRehearsalNotes] = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState('');

  const handleAdd = async () => {
    if (!title.trim()) { setError('Song title is required.'); return; }
    if (!user?.choirId) return;
    setIsLoading(true);
    setError('');
    try {
      await addSong(user.choirId, {
        choirId: user.choirId,
        title: title.trim(),
        artist: artist.trim() || undefined,
        key: key.trim() || undefined,
        youtubeUrl: youtubeUrl.trim() || undefined,
        spotifyUrl: spotifyUrl.trim() || undefined,
        description: description.trim() || undefined,
        lyrics: lyrics.trim() || undefined,
        rehearsalNotes: rehearsalNotes.trim() || undefined,
        addedBy: user.uid,
      });
      router.back();
    } catch {
      setError('Failed to add song. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Add Song"
        showBack
        rightElement={
          <Button label="Save" onPress={handleAdd} isLoading={isLoading} size="sm" />
        }
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.groupLabel}>Song Details</Text>
          <View style={styles.group}>
            <Input label="Song title *" placeholder="e.g. Goodness of God" value={title} onChangeText={setTitle} />
            <Input label="Artist / version" placeholder="e.g. Bethel Music" value={artist} onChangeText={setArtist} />
            <Input label="Key" placeholder="e.g. G major" value={key} onChangeText={setKey} />
          </View>

          <Text style={styles.groupLabel}>Links</Text>
          <View style={styles.group}>
            <Input label="YouTube link" placeholder="https://youtube.com/..." value={youtubeUrl} onChangeText={setYoutubeUrl} keyboardType="url" autoCapitalize="none" />
            <Input label="Spotify link" placeholder="https://open.spotify.com/..." value={spotifyUrl} onChangeText={setSpotifyUrl} keyboardType="url" autoCapitalize="none" />
          </View>

          <Text style={styles.groupLabel}>Notes</Text>
          <View style={styles.group}>
            <Input
              label="Description"
              placeholder="Brief description or context..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, paddingTop: 10 }}
            />
            <Input
              label="Rehearsal notes"
              placeholder="Notes for the team..."
              value={rehearsalNotes}
              onChangeText={setRehearsalNotes}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, paddingTop: 10 }}
            />
            <Input
              label="Lyrics"
              placeholder="Paste lyrics here..."
              value={lyrics}
              onChangeText={setLyrics}
              multiline
              numberOfLines={6}
              style={{ minHeight: 140, paddingTop: 10 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { padding: Spacing.lg, gap: Spacing.base, paddingBottom: 32 },
  groupLabel: {
    ...Typography.caption,
    color: Colors.ink50,
    letterSpacing: 1.5,
    marginTop: Spacing.sm,
    marginBottom: -Spacing.xs,
  },
  group: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.base,
    gap: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.ink10,
  },
  error: {
    ...Typography.bodyMed,
    color: Colors.error,
    backgroundColor: Colors.errorBg,
    padding: Spacing.md,
    borderRadius: 12,
  },
});
