import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuthStore } from '../../../store/authStore';
import { Avatar, Card, LoadingState, Pill, ScreenHeader } from '../../../components/ui';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { Spacing, Radius } from '../../../constants/spacing';
import { ChoirMember, UserRole, VocalPart } from '../../../types';
import { vocalPartLabel, roleLabel } from '../../../lib/utils';

const VOCAL_PARTS: VocalPart[] = ['soprano', 'alto', 'tenor', 'bass', 'instrumentalist', 'unassigned'];
const ROLES: UserRole[] = ['leader', 'member'];

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [member, setMember] = useState<ChoirMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selectedPart, setSelectedPart] = useState<VocalPart>('unassigned');
  const [selectedRole, setSelectedRole] = useState<UserRole>('member');

  const isAdmin = user?.role === 'owner' || user?.role === 'leader';
  const isOwner = user?.role === 'owner';
  const choirId = user?.choirId;

  useEffect(() => {
    const fetch = async () => {
      if (!choirId || !id) return;
      const [memberSnap, userSnap] = await Promise.all([
        getDoc(doc(db, 'choirs', choirId, 'members', id)),
        getDoc(doc(db, 'users', id)),
      ]);
      if (!memberSnap.exists()) { setIsLoading(false); return; }
      const memberData = memberSnap.data();
      const userData   = userSnap.exists() ? userSnap.data() : {};
      const m: ChoirMember = {
        uid: id,
        displayName: userData.displayName ?? 'Unknown',
        email: userData.email ?? '',
        photoURL: userData.photoURL,
        role: memberData.role ?? 'member',
        vocalPart: memberData.vocalPart ?? 'unassigned',
        joinedAt: memberData.joinedAt?.toDate?.() ?? new Date(),
      };
      setMember(m);
      setSelectedPart(m.vocalPart);
      setSelectedRole(m.role);
      setIsLoading(false);
    };
    fetch();
  }, [choirId, id]);

  const handleSave = async () => {
    if (!choirId || !id) return;
    await updateDoc(doc(db, 'choirs', choirId, 'members', id), {
      vocalPart: selectedPart,
      ...(isOwner && { role: selectedRole }),
    });
    setMember((m) => m ? { ...m, vocalPart: selectedPart, role: selectedRole } : m);
    setEditMode(false);
  };

  if (isLoading) return <LoadingState fullScreen />;
  if (!member)   return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Member" showBack />
      <Text style={styles.notFound}>Member not found.</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Member"
        showBack
        rightElement={
          isAdmin ? (
            <TouchableOpacity onPress={() => setEditMode((e) => !e)}>
              <Text style={styles.editBtn}>{editMode ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile */}
        <View style={styles.profile}>
          <Avatar name={member.displayName} photoURL={member.photoURL} size="xl" />
          <Text style={styles.name}>{member.displayName}</Text>
          <Text style={styles.email}>{member.email}</Text>
          <View style={styles.pills}>
            <Pill label={roleLabel[member.role]} variant={member.role} />
            <Pill label={vocalPartLabel[member.vocalPart]} variant={member.vocalPart as any} />
          </View>
        </View>

        {/* Edit section */}
        {editMode && isAdmin && (
          <>
            <Card>
              <Text style={styles.sectionLabel}>VOCAL PART</Text>
              <View style={styles.optionGrid}>
                {VOCAL_PARTS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.optionBtn, selectedPart === p && styles.optionBtnActive]}
                    onPress={() => setSelectedPart(p)}
                  >
                    <Text style={[styles.optionLabel, selectedPart === p && styles.optionLabelActive]}>
                      {vocalPartLabel[p]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {isOwner && member.role !== 'owner' && (
              <Card>
                <Text style={styles.sectionLabel}>ROLE</Text>
                <View style={styles.optionGrid}>
                  {ROLES.map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.optionBtn, selectedRole === r && styles.optionBtnActive]}
                      onPress={() => setSelectedRole(r)}
                    >
                      <Text style={[styles.optionLabel, selectedRole === r && styles.optionLabelActive]}>
                        {roleLabel[r]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceBg },
  scroll: { padding: Spacing.lg, gap: Spacing.base, paddingBottom: 32 },
  profile: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  name: { ...Typography.h1, color: Colors.ink },
  email: { ...Typography.body, color: Colors.ink50 },
  pills: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  sectionLabel: {
    ...Typography.caption, color: Colors.ink50, letterSpacing: 1.5, marginBottom: Spacing.sm,
  },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  optionBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.ink10,
    backgroundColor: Colors.surface,
  },
  optionBtnActive: { borderColor: Colors.p800, backgroundColor: Colors.p50 },
  optionLabel: { ...Typography.label, color: Colors.ink70 },
  optionLabelActive: { color: Colors.p800, fontWeight: '600' },
  saveBtn: {
    backgroundColor: Colors.p800,
    borderRadius: Radius.full,
    padding: Spacing.base,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveBtnText: { ...Typography.bodyMed, color: Colors.white, fontWeight: '600' },
  editBtn: { ...Typography.bodyMed, color: Colors.p600 },
  notFound: { ...Typography.body, color: Colors.ink50, textAlign: 'center', marginTop: Spacing.xl },
});
