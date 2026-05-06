import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Share, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChoirStore } from '../../store/choirStore';
import { useAuthStore } from '../../store/authStore';
import { regenerateInviteCode } from '../../services/choirService';
import { Card, ScreenHeader } from '../../components/ui';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing, Radius, Shadow } from '../../constants/spacing';

export default function InviteScreen() {
  const { choir, setChoir } = useChoirStore();
  const { user } = useAuthStore();
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = user?.role === 'owner';

  const handleShare = async () => {
    if (!choir) return;
    await Share.share({
      message: `Join ${choir.name} on Harmoniq!\n\nUse invite code: ${choir.inviteCode}\n\nDownload Harmoniq to get started.`,
    });
  };

  const handleRegenerate = async () => {
    if (!choir) return;
    setRegenerating(true);
    const code = await regenerateInviteCode(choir.id);
    setChoir({ ...choir, inviteCode: code });
    setRegenerating(false);
  };

  if (!choir) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Invite Members" showBack />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sub}>
          Share this code with your choir members so they can join your workspace.
        </Text>

        {/* Code card */}
        <View style={[styles.codeCard, Shadow.purple]}>
          <Text style={styles.codeLabel}>INVITE CODE</Text>
          <Text style={styles.code}>{choir.inviteCode}</Text>
          <Text style={styles.codeSub}>{choir.name}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={Colors.white} />
            <Text style={styles.actionLabel}>Share Code</Text>
          </TouchableOpacity>

          {isOwner && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSecondary]}
              onPress={handleRegenerate}
              disabled={regenerating}
            >
              <Ionicons name="refresh-outline" size={20} color={Colors.ink50} />
              <Text style={[styles.actionLabel, styles.actionLabelSecondary]}>
                {regenerating ? 'Generating...' : 'Regenerate Code'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* How it works */}
        <Card style={styles.howCard}>
          <Text style={styles.howTitle}>How it works</Text>
          {[
            'Share the invite code with your choir member',
            'They download Harmoniq and create an account',
            'They enter the code to join your choir',
            'You can assign vocal parts and roles from the Members tab',
          ].map((step, i) => (
            <View key={i} style={styles.howStep}>
              <View style={styles.howNum}>
                <Text style={styles.howNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.howText}>{step}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { padding: Spacing.lg, gap: Spacing.xl, paddingBottom: 32 },
  sub: { ...Typography.bodyMD, color: Colors.ink50, textAlign: 'center' },
  codeCard: {
    backgroundColor: Colors.p900,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  codeLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
  },
  code: {
    fontFamily: 'Inter_700Bold',
    fontSize: 44,
    color: Colors.white,
    letterSpacing: 8,
  },
  codeSub: { ...Typography.body, color: 'rgba(255,255,255,0.6)' },
  actions: { gap: Spacing.sm },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.p800,
    borderRadius: Radius.full,
    padding: Spacing.base,
  },
  actionBtnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.ink10,
  },
  actionLabel: { ...Typography.bodyMed, color: Colors.white, fontWeight: '600' },
  actionLabelSecondary: { color: Colors.ink50 },
  howCard: { gap: Spacing.base },
  howTitle: { ...Typography.h3, color: Colors.ink },
  howStep: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  howNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.p50,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  howNumText: { ...Typography.label, color: Colors.p800, fontWeight: '700' },
  howText: { ...Typography.body, color: Colors.ink70, flex: 1, lineHeight: 22 },
});
