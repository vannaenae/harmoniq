import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuthStore } from '../../../store/authStore';
import { Button, Input, ScreenHeader } from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Spacing } from '../../../constants/spacing';

export default function CreateAnnouncementScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [title, setTitle]   = useState('');
  const [body, setBody]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]   = useState('');

  const handlePost = async () => {
    if (!title.trim()) { setError('Please add a title.'); return; }
    if (!body.trim())  { setError('Please add a message.'); return; }
    if (!user?.choirId) return;

    setIsLoading(true);
    setError('');
    try {
      await addDoc(collection(db, 'choirs', user.choirId, 'announcements'), {
        choirId: user.choirId,
        title: title.trim(),
        body: body.trim(),
        authorId: user.uid,
        authorName: user.displayName,
        createdAt: serverTimestamp(),
        pinned: false,
      });
      router.back();
    } catch {
      setError('Failed to post announcement.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="New Announcement"
        showBack
        rightElement={
          <Button label="Post" onPress={handlePost} isLoading={isLoading} size="sm" />
        }
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.group}>
            <Input label="Title" placeholder="e.g. Sunday Rehearsal Update" value={title} onChangeText={setTitle} />
            <Input
              label="Message"
              placeholder="Write your announcement here..."
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={8}
              style={{ minHeight: 160, paddingTop: 10 }}
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
