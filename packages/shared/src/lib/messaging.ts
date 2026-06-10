import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import { toDate } from './firestore'
import { generateId } from './utils'
import type { Channel, Message, ChannelVisibility } from '../types'

// ── Firestore path helpers ────────────────────────────────────────────────────

const channelsCol = (choirId: string) =>
  collection(db, 'choirs', choirId, 'channels')

const messagesCol = (choirId: string, channelId: string) =>
  collection(db, 'choirs', choirId, 'channels', channelId, 'messages')

// ── Channel helpers ───────────────────────────────────────────────────────────

function docToChannel(id: string, data: Record<string, unknown>): Channel {
  return {
    ...data,
    id,
    createdAt: toDate(data.createdAt),
    lastMessageAt: data.lastMessageAt ? toDate(data.lastMessageAt) : undefined,
  } as Channel
}

function docToMessage(id: string, data: Record<string, unknown>): Message {
  return {
    ...data,
    id,
    createdAt: toDate(data.createdAt),
    editedAt: data.editedAt ? toDate(data.editedAt) : undefined,
    reactions: (data.reactions as Record<string, string[]>) ?? {},
    pinned: Boolean(data.pinned),
  } as Message
}

// ── Default channels seed ─────────────────────────────────────────────────────

export const DEFAULT_CHANNELS: Omit<Channel, 'id' | 'choirId' | 'createdBy' | 'createdAt'>[] = [
  {
    name: 'general',
    description: 'Open to everyone',
    category: 'general',
    visibleTo: 'all',
    directorOnly: false,
    order: 0,
  },
  {
    name: 'vocalists',
    description: 'Soprano, Alto, Tenor, Bass',
    category: 'sections',
    visibleTo: 'vocalists',
    directorOnly: false,
    order: 1,
  },
  {
    name: 'instrumentalists',
    description: 'Keys, Guitar, Bass, Drums',
    category: 'sections',
    visibleTo: 'instrumentalists',
    directorOnly: false,
    order: 2,
  },
  {
    name: 'planning',
    description: 'Directors only',
    category: 'planning',
    visibleTo: 'directors',
    directorOnly: true,
    order: 3,
  },
  {
    name: 'announcements',
    description: 'Important updates',
    category: 'announcements',
    visibleTo: 'all',
    directorOnly: true,
    order: 4,
  },
]

/** Seed default channels for a new choir if none exist. */
export async function seedDefaultChannels(choirId: string, creatorId: string): Promise<void> {
  const existing = await getDocs(channelsCol(choirId))
  if (!existing.empty) return
  await Promise.all(
    DEFAULT_CHANNELS.map(ch =>
      setDoc(doc(channelsCol(choirId), generateId()), {
        ...ch,
        choirId,
        createdBy: creatorId,
        createdAt: serverTimestamp(),
        lastMessageAt: null,
        lastMessagePreview: null,
      }),
    ),
  )
}

export async function listChannels(choirId: string): Promise<Channel[]> {
  const snap = await getDocs(query(channelsCol(choirId), orderBy('order', 'asc')))
  return snap.docs.map(d => docToChannel(d.id, d.data() as Record<string, unknown>))
}

export interface NewChannelInput {
  name: string
  description?: string
  category: Channel['category']
  visibleTo: ChannelVisibility
  directorOnly: boolean
}

export async function createChannel(
  choirId: string,
  input: NewChannelInput,
  creatorId: string,
): Promise<string> {
  const existing = await getDocs(channelsCol(choirId))
  const ref = doc(channelsCol(choirId), generateId())
  await setDoc(ref, {
    ...input,
    id: ref.id,
    choirId,
    createdBy: creatorId,
    order: existing.size,
    createdAt: serverTimestamp(),
    lastMessageAt: null,
    lastMessagePreview: null,
  })
  return ref.id
}

export async function deleteChannel(choirId: string, channelId: string): Promise<void> {
  await deleteDoc(doc(channelsCol(choirId), channelId))
}

// ── Message helpers ───────────────────────────────────────────────────────────

export interface SendMessageInput {
  text: string
  authorId: string
  authorName: string
  authorPhotoUrl?: string
}

export async function sendMessage(
  choirId: string,
  channelId: string,
  input: SendMessageInput,
): Promise<string> {
  const ref = await addDoc(messagesCol(choirId, channelId), {
    channelId,
    text: input.text,
    authorId: input.authorId,
    authorName: input.authorName,
    authorPhotoUrl: input.authorPhotoUrl ?? null,
    createdAt: serverTimestamp(),
    editedAt: null,
    pinned: false,
    reactions: {},
  })

  await updateDoc(doc(channelsCol(choirId), channelId), {
    lastMessageAt: serverTimestamp(),
    lastMessagePreview: input.text.slice(0, 80),
  })

  return ref.id
}

export async function editMessage(
  choirId: string,
  channelId: string,
  messageId: string,
  newText: string,
): Promise<void> {
  await updateDoc(doc(messagesCol(choirId, channelId), messageId), {
    text: newText,
    editedAt: serverTimestamp(),
  })
}

export async function deleteMessage(
  choirId: string,
  channelId: string,
  messageId: string,
): Promise<void> {
  await deleteDoc(doc(messagesCol(choirId, channelId), messageId))
}

export async function pinMessage(
  choirId: string,
  channelId: string,
  messageId: string,
  pinned: boolean,
): Promise<void> {
  await updateDoc(doc(messagesCol(choirId, channelId), messageId), { pinned })
}

export async function toggleReaction(
  choirId: string,
  channelId: string,
  messageId: string,
  emoji: string,
  userId: string,
): Promise<void> {
  const ref = doc(messagesCol(choirId, channelId), messageId)
  const field = `reactions.${emoji}`
  // We toggle: if user already reacted, remove; otherwise add
  // We optimistically call both — Firestore will no-op the wrong one
  // Instead, read first (cheap, cached)
  const { getDoc } = await import('firebase/firestore')
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const existing = (snap.data().reactions?.[emoji] ?? []) as string[]
  if (existing.includes(userId)) {
    await updateDoc(ref, { [field]: arrayRemove(userId) })
  } else {
    await updateDoc(ref, { [field]: arrayUnion(userId) })
  }
}

export function subscribeToMessages(
  choirId: string,
  channelId: string,
  callback: (messages: Message[]) => void,
): Unsubscribe {
  const q = query(messagesCol(choirId, channelId), orderBy('createdAt', 'asc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => docToMessage(d.id, d.data() as Record<string, unknown>)))
  })
}

export function subscribeToChannels(
  choirId: string,
  callback: (channels: Channel[]) => void,
): Unsubscribe {
  const q = query(channelsCol(choirId), orderBy('order', 'asc'))
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => docToChannel(d.id, d.data() as Record<string, unknown>)))
  })
}
