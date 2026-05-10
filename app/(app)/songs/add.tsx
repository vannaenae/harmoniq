import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { addSong } from '../../../services/songService';
import { useAuthStore } from '../../../store/authStore';
import { Colors, Gradients } from '../../../constants/colors';
import { Spacing, Radius } from '../../../constants/spacing';

const KEYS   = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const GENRES = ['Gospel', 'Contemporary', 'Hymn', 'Modern', 'Anthem', 'Other'] as const;

export default function AddSongScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [title, setTitle]       = useState('');
  const [artist, setArtist]     = useState('');
  const [baseKey, setBaseKey]   = useState('');
  const [accidental, setAccidental] = useState<'' | '#' | 'b'>('');
  const [isMinor, setIsMinor]   = useState(false);
  const [genre, setGenre]       = useState<typeof GENRES[number]>('Contemporary');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [lyrics, setLyrics]     = useState('');
  const [notes, setNotes]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');

  const fullKey = baseKey ? `${baseKey}${accidental}${isMinor ? 'm' : ''}` : '';

  const handleAdd = async () => {
    if (!title.trim()) { setError('Song title is required.'); return; }
    if (!user?.choirId) return;
    setIsLoading(true);
    setError('');
    try {
      await addSong(user.choirId, {
        choirId:      user.choirId,
        title:        title.trim(),
        artist:       artist.trim()     || undefined,
        key:          fullKey           || undefined,
        genre,
        youtubeUrl:   youtubeUrl.trim() || undefined,
        spotifyUrl:   spotifyUrl.trim() || undefined,
        lyrics:       lyrics.trim()     || undefined,
        rehearsalNotes: notes.trim()   || undefined,
        addedBy:      user.uid,
      });
      router.back();
    } catch {
      setError('Failed to add song. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Arrangement</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Song details card */}
          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>SONG TITLE</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Goodness of God"
                placeholderTextColor={Colors.ink30}
                value={title}
                onChangeText={setTitle}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>ARTIST / WRITER</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Bethel Music"
                placeholderTextColor={Colors.ink30}
                value={artist}
                onChangeText={setArtist}
              />
            </View>
          </View>

          {/* Key selector */}
          <Text style={styles.sectionLabel}>ORIGINAL KEY</Text>
          <View style={styles.card}>
            <View style={styles.keyRow}>
              {KEYS.map(k => (
                <TouchableOpacity
                  key={k}
                  style={[styles.keyBtn, baseKey === k && styles.keyBtnActive]}
                  onPress={() => setBaseKey(prev => prev === k ? '' : k)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.keyBtnText, baseKey === k && styles.keyBtnTextActive]}>{k}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Accidentals + minor */}
            <View style={styles.accidentalRow}>
              <Text style={styles.accLabel}>ADD ACCIDENTAL / MINOR</Text>
              <View style={styles.accBtns}>
                {(['#', 'b', ''] as const).map(acc => (
                  <TouchableOpacity
                    key={acc || 'natural'}
                    style={[styles.accBtn, accidental === acc && styles.accBtnActive]}
                    onPress={() => setAccidental(acc)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.accBtnText, accidental === acc && styles.accBtnTextActive]}>
                      {acc === '#' ? '♯' : acc === 'b' ? '♭' : '♮'}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.accBtn, isMinor && styles.accBtnActive]}
                  onPress={() => setIsMinor(p => !p)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.accBtnText, isMinor && styles.accBtnTextActive]}>min</Text>
                </TouchableOpacity>
              </View>
            </View>

            {fullKey ? (
              <View style={styles.keyPreview}>
                <Text style={styles.keyPreviewLabel}>Key: </Text>
                <Text style={styles.keyPreviewValue}>{fullKey}</Text>
              </View>
            ) : null}
          </View>

          {/* Genre */}
          <Text style={styles.sectionLabel}>GENRE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreRow}>
            {GENRES.map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.genreChip, genre === g && styles.genreChipActive]}
                onPress={() => setGenre(g)}
                activeOpacity={0.7}
              >
                <Text style={[styles.genreChipText, genre === g && styles.genreChipTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Reference media */}
          <Text style={styles.sectionLabel}>REFERENCE MEDIA</Text>
          <View style={styles.card}>
            <View style={styles.mediaRow}>
              <View style={styles.mediaIcon}>
                <Ionicons name="logo-youtube" size={18} color="#FF0000" />
              </View>
              <TextInput
                style={styles.mediaInput}
                placeholder="YouTube Link"
                placeholderTextColor={Colors.ink30}
                value={youtubeUrl}
                onChangeText={setYoutubeUrl}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.mediaRow}>
              <View style={styles.mediaIcon}>
                <Ionicons name="musical-notes" size={18} color="#1DB954" />
              </View>
              <TextInput
                style={styles.mediaInput}
                placeholder="Spotify Link"
                placeholderTextColor={Colors.ink30}
                value={spotifyUrl}
                onChangeText={setSpotifyUrl}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Lyrics */}
          <Text style={styles.sectionLabel}>LYRICS</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.lyricsInput}
              placeholder="Paste lyrics here..."
              placeholderTextColor={Colors.ink30}
              value={lyrics}
              onChangeText={setLyrics}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Rehearsal notes */}
          <Text style={styles.sectionLabel}>REHEARSAL NOTES</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.notesInput}
              placeholder="Notes for the team..."
              placeholderTextColor={Colors.ink30}
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleAdd}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={Gradients.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtnGradient}
            >
              <Text style={styles.saveBtnText}>{isLoading ? 'Saving…' : 'Add Song'}</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ink10,
    backgroundColor: Colors.surface,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceMid,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  scroll: { padding: Spacing.lg, gap: Spacing.base, paddingBottom: 40 },

  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.ink50,
    textTransform: 'uppercase',
    marginTop: Spacing.sm,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.ink10,
    overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: Colors.ink10 },

  fieldGroup: { padding: Spacing.base, gap: 6 },
  fieldLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.4,
    color: Colors.ink50,
    textTransform: 'uppercase',
  },
  input: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    color: Colors.ink,
    paddingVertical: 4,
  },

  // Key selector
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.base,
    gap: 6,
  },
  keyBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.ink10,
    backgroundColor: Colors.surfaceMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBtnActive: {
    backgroundColor: Colors.p800,
    borderColor: Colors.p800,
  },
  keyBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: Colors.ink50,
  },
  keyBtnTextActive: { color: Colors.white },

  accidentalRow: {
    padding: Spacing.base,
    paddingTop: 0,
    gap: Spacing.sm,
  },
  accLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1.4,
    color: Colors.ink50,
    textTransform: 'uppercase',
  },
  accBtns: { flexDirection: 'row', gap: Spacing.sm },
  accBtn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.ink10,
    backgroundColor: Colors.surfaceMid,
  },
  accBtnActive: { backgroundColor: Colors.p800, borderColor: Colors.p800 },
  accBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.ink50,
  },
  accBtnTextActive: { color: Colors.white },

  keyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
  },
  keyPreviewLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.ink50,
  },
  keyPreviewValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.p900,
    letterSpacing: -0.3,
  },

  // Genre chips
  genreRow: { gap: Spacing.sm, paddingBottom: 2 },
  genreChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.ink10,
    backgroundColor: Colors.surface,
  },
  genreChipActive: { backgroundColor: Colors.p800, borderColor: Colors.p800 },
  genreChipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: Colors.ink50,
  },
  genreChipTextActive: { color: Colors.white },

  // Media
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    gap: Spacing.base,
  },
  mediaIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.surfaceMid,
    alignItems: 'center', justifyContent: 'center',
  },
  mediaInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.ink,
  },

  // Lyrics / notes
  lyricsInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.ink,
    lineHeight: 22,
    minHeight: 160,
    padding: Spacing.base,
  },
  notesInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.ink,
    lineHeight: 22,
    minHeight: 80,
    padding: Spacing.base,
  },

  // Save button
  saveBtn: { borderRadius: Radius.full, overflow: 'hidden' },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 16,
  },
  saveBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: Colors.white,
  },

  errorBanner: {
    backgroundColor: Colors.errorBg,
    borderRadius: 12,
    padding: Spacing.base,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.error,
  },
});
