import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
  query,
  where,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import { generateId } from './utils'
import { toDate } from './firestore'
import type { AppNotification, NotificationCategory } from '../types'

const notifCol = (choirId: string) => collection(db, 'choirs', choirId, 'notifications')

/** Create an in-app notification for a recipient.
 *  API_POINT: FCM — push delivery is v2; for v1 this only writes the in-app record. */
export async function createNotification(
  choirId: string,
  recipientId: string,
  category: NotificationCategory,
  title: string,
  body: string,
  deepLink?: string,
): Promise<void> {
  const id = generateId()
  await setDoc(doc(db, 'choirs', choirId, 'notifications', id), {
    id,
    choirId,
    userId: recipientId,
    category,
    title,
    body,
    read: false,
    deepLink: deepLink ?? null,
    createdAt: serverTimestamp(),
  })
}

/** Fan-out a notification to many recipients (e.g. service published, announcement). */
export async function broadcastNotification(
  choirId: string,
  recipientIds: string[],
  category: NotificationCategory,
  title: string,
  body: string,
  deepLink?: string,
): Promise<void> {
  await Promise.all(
    recipientIds.map(uid => createNotification(choirId, uid, category, title, body, deepLink)),
  )
}

export async function listMyNotifications(
  choirId: string,
  userId: string,
): Promise<AppNotification[]> {
  // Avoid composite-index requirement: filter by user, sort client-side
  const snap = await getDocs(query(notifCol(choirId), where('userId', '==', userId)))
  return snap.docs
    .map(d => {
      const data = d.data()
      return { ...data, id: d.id, createdAt: toDate(data.createdAt) } as AppNotification
    })
    .sort((a, b) => +b.createdAt - +a.createdAt)
}

export async function markNotificationRead(choirId: string, notificationId: string): Promise<void> {
  await updateDoc(doc(db, 'choirs', choirId, 'notifications', notificationId), { read: true })
}

export async function markAllRead(choirId: string, userId: string): Promise<void> {
  const snap = await getDocs(
    query(notifCol(choirId), where('userId', '==', userId), where('read', '==', false)),
  )
  const batch = writeBatch(db)
  snap.docs.forEach(d => batch.update(d.ref, { read: true }))
  await batch.commit()
}

export async function countUnread(choirId: string, userId: string): Promise<number> {
  const snap = await getDocs(
    query(notifCol(choirId), where('userId', '==', userId), where('read', '==', false)),
  )
  return snap.size
}

/** Real-time listener for this user's notifications, sorted newest-first. */
export function subscribeMyNotifications(
  choirId: string,
  userId: string,
  callback: (notifications: AppNotification[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(notifCol(choirId), where('userId', '==', userId)),
    snap => {
      const items = snap.docs
        .map(d => {
          const data = d.data()
          return { ...data, id: d.id, createdAt: toDate(data.createdAt) } as AppNotification
        })
        .sort((a, b) => +b.createdAt - +a.createdAt)
      callback(items)
    },
    onError,
  )
}

/** Real-time listener for the unread notification count. */
export function subscribeUnreadCount(
  choirId: string,
  userId: string,
  callback: (count: number) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(notifCol(choirId), where('userId', '==', userId), where('read', '==', false)),
    snap => callback(snap.size),
    onError,
  )
}
