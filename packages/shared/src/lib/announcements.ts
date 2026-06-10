import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import { generateId } from './utils'
import { toDate } from './firestore'
import type { Announcement, VoicePart } from '../types'

const annCol = (choirId: string) => collection(db, 'choirs', choirId, 'announcements')

export interface AnnouncementInput {
  title: string
  body: string // sanitized HTML
  pinned: boolean
  targetVoiceParts?: VoicePart[]
}

export async function createAnnouncement(
  choirId: string,
  authorId: string,
  authorName: string,
  input: AnnouncementInput,
): Promise<string> {
  const id = generateId()
  await setDoc(doc(db, 'choirs', choirId, 'announcements', id), {
    id,
    choirId,
    title: input.title,
    body: input.body,
    pinned: input.pinned,
    targetVoiceParts: input.targetVoiceParts ?? null,
    authorId,
    authorName,
    readBy: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return id
}

export interface AnnouncementWithRead extends Announcement {
  readBy: string[]
}

/** Announcements visible to a member, pinned first then newest first. */
export async function listAnnouncements(
  choirId: string,
  voicePart?: VoicePart,
): Promise<AnnouncementWithRead[]> {
  const snap = await getDocs(annCol(choirId))
  return snap.docs
    .map(d => {
      const data = d.data()
      return {
        ...data,
        id: d.id,
        readBy: (data.readBy as string[]) ?? [],
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      } as AnnouncementWithRead
    })
    .filter(a => {
      // targeted announcements only show to the matching voice parts
      if (!a.targetVoiceParts || a.targetVoiceParts.length === 0) return true
      return voicePart ? a.targetVoiceParts.includes(voicePart) : true
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return +b.createdAt - +a.createdAt
    })
}

/** Real-time listener for announcements, with client-side filtering/sorting. */
export function subscribeAnnouncements(
  choirId: string,
  voicePart: VoicePart | undefined,
  callback: (items: AnnouncementWithRead[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    annCol(choirId),
    snap => {
      const items = snap.docs
        .map(d => {
          const data = d.data()
          return {
            ...data,
            id: d.id,
            readBy: (data.readBy as string[]) ?? [],
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
          } as AnnouncementWithRead
        })
        .filter(a => {
          if (!a.targetVoiceParts || a.targetVoiceParts.length === 0) return true
          return voicePart ? a.targetVoiceParts.includes(voicePart) : true
        })
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
          return +b.createdAt - +a.createdAt
        })
      callback(items)
    },
    onError,
  )
}

export async function markAnnouncementRead(
  choirId: string,
  announcementId: string,
  userId: string,
): Promise<void> {
  await updateDoc(doc(db, 'choirs', choirId, 'announcements', announcementId), {
    readBy: arrayUnion(userId),
  }).catch(() => {})
}
