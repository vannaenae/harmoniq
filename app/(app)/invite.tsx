import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Share, TouchableOpacity,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChoirStore } from '../../store/choirStore';
import { useAuthStore } from '../../store/authStore';
import { regenerateInviteCode } from '../../services/choirService';
import { ScreenHeader } from '../../components/ui';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';

export default function InviteScreen() {
  const { choir, setChoir } = useChoirStore();
  const { user } = useAuthStore();
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = user?.role === 'owner';

  const handleCopy = () => {
    if (!choir?.inviteCode) return;
    await Clipboard.setStringAsync(choir.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      <ScreenHeader title="Grow the Choir" showBack />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sub}>
          Invite vocalists and musicians to sync up with your upcoming worship sets.
        </Text>

        {/* Code card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeEyebrow}>YOUR UNIQUE ACCESS CODE</Text>
          <Text style={styles.code}>{choir.inviteCode}</Text>

          {/* Copy button */}
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.8}>
            <Ionicons
              name={copied ? 'checkmark-circle-outline' : 'copy-outline'}
              size={18}
              color={Colors.p800}
            />
            <Text style={styles.copyBtnText}>
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Share action */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
          <Ionicons name="share-outline" size={20} color={Colors.white} />
          <Text style={styles.shareBtnText}>Share Invite Link</Text>
        </TouchableOpacity>

        {/* Recently Joined */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Joined</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>12 Total</Text>
            </View>
          </View>

          {/* Mock recently joined — in production, load from Firestore members */}
          {[
            { initials: 'ER', name: 'Elena Rodriguez', sub: 'Alto Section Leader', status: 'Accepted',  statusColor: Colors.success  },
            { initials: 'MC', name: 'Marcus Chen',     sub: 'Acoustic Guitar',      status: 'New',       statusColor: Colors.p700     },
            { initials: 'SJ', name: 'Sarah Jenkins',   sub: '',                     status: 'Pending',   statusColor: Colors.warning  },
          ].map((m, i) => (
            <View key={i} style={styles.memberRow}>
              <View style={[styles.avatar, { backgroundColor: i % 2 === 0 ? Colors.p800 : Colors.secondary }]}>
                <Text style={styles.avatarText}>{m.initials}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{m.name}</Text>
                {m.sub ? <Text style={styles.memberSub}>{m.sub}</Text> : null}
              </View>
              <View style={[styles.statusPill, { backgroundColor: m.statusColor + '20' }]}>
                <Text style={[styles.statusText, { color: m.statusColor }]}>{m.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {isOwner && (
          <TouchableOpacity
            style={styles.regenBtn}
            onPress={handleRegenerate}
            disabled={regenerating}
          >
            <Ionicons name="refresh-outline" size={18} color={Colors.ink50} />
            <Text style={styles.regenText}>
              {regenerating ? 'Generating…' : 'Regenerate Code'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { padding: Spacing.lg, gap: Spacing.xl, paddingBottom: 40 },

  sub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.ink70,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: -Spacing.base,
  },

  codeCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.ink10,
    shadowColor: Colors.p900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  codeEyebrow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.ink50,
    textTransform: 'uppercase',
  },
  code: {
    fontFamily: 'Inter_700Bold',
    fontSize: 44,
    color: Colors.p900,
    letterSpacing: 10,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.p800,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: Spacing.xs,
  },
  copyBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.p800,
  },

  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.p800,
    borderRadius: Radius.full,
    paddingVertical: Spacing.base,
    marginTop: -Spacing.base,
  },
  shareBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.white,
  },

  section: { gap: Spacing.base },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.ink,
  },
  countBadge: {
    backgroundColor: Colors.surfaceMid,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  countText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.ink70,
  },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.ink10,
    gap: Spacing.base,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: Colors.white,
  },
  memberInfo: { flex: 1, gap: 2 },
  memberName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.ink,
  },
  memberSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.ink50,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },

  regenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.base,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.ink10,
  },
  regenText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.ink50,
  },
});
