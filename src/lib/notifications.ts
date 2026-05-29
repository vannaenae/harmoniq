import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { generateId } from '@/lib/utils'
import { toDate } from '@/lib/firestore'
import type { AppNotification, NotificationCategory } from '@/types'

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
