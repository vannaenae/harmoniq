import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { generateId } from './utils'
import { toDate } from './firestore'
import type { UserRole, VoicePart } from '../types'

// ── Member management (Director) ────────────────────────────────────────────

export async function updateMemberRole(
  choirId: string,
  uid: string,
  role: UserRole,
): Promise<void> {
  await updateDoc(doc(db, 'choirs', choirId, 'members', uid), { role })
  // Mirror onto the user record so guards/queries stay consistent
  await updateDoc(doc(db, 'users', uid), { role, updatedAt: serverTimestamp() }).catch(() => {})
}

export async function updateMemberVoicePart(
  choirId: string,
  uid: string,
  voicePart: VoicePart,
): Promise<void> {
  await updateDoc(doc(db, 'choirs', choirId, 'members', uid), { voicePart })
  await updateDoc(doc(db, 'users', uid), { voicePart, updatedAt: serverTimestamp() }).catch(() => {})
}

export async function updateMemberCanLead(
  choirId: string,
  uid: string,
  canLead: boolean,
): Promise<void> {
  await updateDoc(doc(db, 'choirs', choirId, 'members', uid), { canLead })
}

export async function removeMember(choirId: string, uid: string): Promise<void> {
  await deleteDoc(doc(db, 'choirs', choirId, 'members', uid))
}

// ── Voice part change requests (Member → Director) ──────────────────────────

export interface VoicePartRequest {
  id: string
  uid: string
  displayName: string
  currentPart: VoicePart
  requestedPart: VoicePart
  note?: string
  status: 'pending' | 'approved' | 'declined'
  createdAt: Date
}

const requestsCol = (choirId: string) => collection(db, 'choirs', choirId, 'voicePartRequests')

export async function createVoicePartRequest(
  choirId: string,
  uid: string,
  displayName: string,
  currentPart: VoicePart,
  requestedPart: VoicePart,
  note?: string,
): Promise<string> {
  const id = generateId()
  await setDoc(doc(db, 'choirs', choirId, 'voicePartRequests', id), {
    id,
    uid,
    displayName,
    currentPart,
    requestedPart,
    note: note ?? null,
    status: 'pending',
    createdAt: serverTimestamp(),
  })
  return id
}

export async function listPendingVoicePartRequests(choirId: string): Promise<VoicePartRequest[]> {
  const snap = await getDocs(query(requestsCol(choirId), where('status', '==', 'pending')))
  return snap.docs.map(d => {
    const data = d.data()
    return { ...data, id: d.id, createdAt: toDate(data.createdAt) } as VoicePartRequest
  })
}

export async function listVoicePartRequestsForMember(
  choirId: string,
  uid: string,
): Promise<VoicePartRequest[]> {
  const snap = await getDocs(
    query(requestsCol(choirId), where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(5)),
  )
  return snap.docs.map(d => {
    const data = d.data()
    return { ...data, id: d.id, createdAt: toDate(data.createdAt) } as VoicePartRequest
  })
}

/** Approve or decline a voice part change request.
 *  When approved, automatically updates the member's voice part. */
export async function resolveVoicePartRequest(
  choirId: string,
  requestId: string,
  decision: 'approved' | 'declined',
  memberId: string,
  newPart: VoicePart,
): Promise<void> {
  await updateDoc(doc(db, 'choirs', choirId, 'voicePartRequests', requestId), {
    status: decision,
    resolvedAt: serverTimestamp(),
  })
  if (decision === 'approved') {
    await updateMemberVoicePart(choirId, memberId, newPart)
  }
}
