import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { toDate } from '@/lib/firestore'
import { generateId } from '@/lib/utils'
import type { Channel, Message, MessageAttachment, ReplyPreview, TypingUser, ChannelVisibility } from '@/types'

// ── Firestore path helpers ────────────────────────────────────────────────────

const channelsCol = (choirId: string) =>
  collection(db, 'choirs', choirId, 'channels')

const messagesCol = (choirId: string, channelId: string) =>
  collection(db, 'choirs', choirId, 'channels', channelId, 'messages')

const typingCol = (choirId: string, channelId: string) =>
  collection(db, 'choirs', choirId, 'channels', channelId, 'typing')

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
    attachments: (data.attachments as MessageAttachment[]) ?? [],
    replyTo: (data.replyTo as ReplyPreview) ?? undefined,
    parentId: (data.parentId as string) ?? undefined,
    threadCount: (data.threadCount as number) ?? 0,
    threadLastReplyAt: data.threadLastReplyAt ? toDate(data.threadLastReplyAt) : undefined,
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

// ── Attachments ───────────────────────────────────────────────────────────────

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024 // mirrors storage.rules cap

function imageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
}

/** Upload files to Storage under the choir's channel folder; returns attachment metadata. */
export async function uploadAttachments(
  choirId: string,
  channelId: string,
  files: File[],
): Promise<MessageAttachment[]> {
  return Promise.all(
    files.map(async file => {
      const safeName = file.name.replace(/[^\w.\-() ]+/g, '_')
      const path = `choirs/${choirId}/channels/${channelId}/${generateId()}-${safeName}`
      const ref = storageRef(storage, path)
      await uploadBytes(ref, file, { contentType: file.type || 'application/octet-stream' })
      const url = await getDownloadURL(ref)
      const attachment: MessageAttachment = {
        url,
        name: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size,
      }
      if (file.type.startsWith('image/')) {
        const dims = await imageDimensions(file)
        if (dims) {
          attachment.width = dims.width
          attachment.height = dims.height
        }
      }
      return attachment
    }),
  )
}

export function attachmentPreviewLabel(attachments: MessageAttachment[]): string {
  if (attachments.length === 0) return ''
  const allImages = attachments.every(a => a.contentType.startsWith('image/'))
  if (allImages) return attachments.length === 1 ? '📷 Photo' : `📷 ${attachments.length} photos`
  return `📎 ${attachments[0].name}`
}

// ── Message helpers ───────────────────────────────────────────────────────────

export interface SendMessageInput {
  text: string
  authorId: string
  authorName: string
  authorPhotoUrl?: string
  attachments?: MessageAttachment[]
  replyTo?: ReplyPreview | null
  /** Root message id when posting into a thread */
  parentId?: string | null
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
    attachments: input.attachments ?? [],
    replyTo: input.replyTo ?? null,
    parentId: input.parentId ?? null,
    threadCount: 0,
    threadLastReplyAt: null,
  })

  if (input.parentId) {
    // Thread reply — bump the root message's counters instead of channel preview
    await updateDoc(doc(messagesCol(choirId, channelId), input.parentId), {
      threadCount: increment(1),
      threadLastReplyAt: serverTimestamp(),
    }).catch(() => {})
  } else {
    const preview = input.text
      ? input.text.slice(0, 80)
      : attachmentPreviewLabel(input.attachments ?? [])
    await updateDoc(doc(channelsCol(choirId), channelId), {
      lastMessageAt: serverTimestamp(),
      lastMessagePreview: preview,
    })
  }

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
  message: Pick<Message, 'id' | 'parentId' | 'threadCount'>,
): Promise<void> {
  // Deleting a root message removes its thread replies too
  if (!message.parentId && message.threadCount > 0) {
    const replies = await getDocs(
      query(messagesCol(choirId, channelId), where('parentId', '==', message.id)),
    ).catch(() => null)
    if (replies && !replies.empty) {
      const batch = writeBatch(db)
      replies.docs.forEach(d => batch.delete(d.ref))
      batch.delete(doc(messagesCol(choirId, channelId), message.id))
      await batch.commit()
      return
    }
  }

  await deleteDoc(doc(messagesCol(choirId, channelId), message.id))

  // Deleting a thread reply decrements the root's counter
  if (message.parentId) {
    await updateDoc(doc(messagesCol(choirId, channelId), message.parentId), {
      threadCount: increment(-1),
    }).catch(() => {})
  }
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
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const existing = (snap.data().reactions?.[emoji] ?? []) as string[]
  if (existing.includes(userId)) {
    await updateDoc(ref, { [field]: arrayRemove(userId) })
  } else {
    await updateDoc(ref, { [field]: arrayUnion(userId) })
  }
}

/** Top-level channel messages (thread replies are filtered out client-side so
 *  legacy messages without a parentId field keep working). */
export function subscribeToMessages(
  choirId: string,
  channelId: string,
  callback: (messages: Message[]) => void,
): Unsubscribe {
  const q = query(messagesCol(choirId, channelId), orderBy('createdAt', 'asc'))
  return onSnapshot(q, snap => {
    const all = snap.docs.map(d => docToMessage(d.id, d.data() as Record<string, unknown>))
    callback(all.filter(m => !m.parentId))
  })
}

/** Replies inside a single thread, oldest first. */
export function subscribeToThread(
  choirId: string,
  channelId: string,
  parentId: string,
  callback: (messages: Message[]) => void,
): Unsubscribe {
  const q = query(messagesCol(choirId, channelId), where('parentId', '==', parentId))
  return onSnapshot(q, snap => {
    const replies = snap.docs.map(d => docToMessage(d.id, d.data() as Record<string, unknown>))
    replies.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    callback(replies)
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

// ── Typing indicators ─────────────────────────────────────────────────────────

export const TYPING_TTL_MS = 6000

/** Mark the current user as typing. Callers should throttle (every ~2.5s). */
export async function setTyping(
  choirId: string,
  channelId: string,
  uid: string,
  name: string,
): Promise<void> {
  await setDoc(doc(typingCol(choirId, channelId), uid), {
    uid,
    name,
    at: Date.now(),
  }).catch(() => {})
}

export async function clearTyping(
  choirId: string,
  channelId: string,
  uid: string,
): Promise<void> {
  await deleteDoc(doc(typingCol(choirId, channelId), uid)).catch(() => {})
}

export function subscribeToTyping(
  choirId: string,
  channelId: string,
  callback: (users: TypingUser[]) => void,
): Unsubscribe {
  return onSnapshot(typingCol(choirId, channelId), snap => {
    callback(snap.docs.map(d => d.data() as TypingUser))
  })
}
