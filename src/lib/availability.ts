import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toDate } from '@/lib/firestore'
import type { Availability, AvailabilityStatus } from '@/types'

const availCol = (choirId: string, serviceId: string) =>
  collection(db, 'choirs', choirId, 'services', serviceId, 'availability')

/** All availability records for a service, keyed for quick lookup */
export async function getServiceAvailability(
  choirId: string,
  serviceId: string,
): Promise<Record<string, Availability>> {
  const snap = await getDocs(availCol(choirId, serviceId))
  const map: Record<string, Availability> = {}
  snap.docs.forEach(d => {
    const data = d.data()
    map[d.id] = {
      ...data,
      id: d.id,
      userId: d.id,
      updatedAt: toDate(data.updatedAt),
    } as Availability
  })
  return map
}

/** Real-time listener for availability on a service. */
export function subscribeAvailability(
  choirId: string,
  serviceId: string,
  callback: (avail: Record<string, Availability>) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    availCol(choirId, serviceId),
    snap => {
      const map: Record<string, Availability> = {}
      snap.docs.forEach(d => {
        const data = d.data()
        map[d.id] = {
          ...data,
          id: d.id,
          userId: d.id,
          updatedAt: toDate(data.updatedAt),
        } as Availability
      })
      callback(map)
    },
    onError,
  )
}

export async function getMyAvailability(
  choirId: string,
  serviceId: string,
  userId: string,
): Promise<Availability | null> {
  const snap = await getDoc(doc(db, 'choirs', choirId, 'services', serviceId, 'availability', userId))
  if (!snap.exists()) return null
  const data = snap.data()
  return { ...data, id: snap.id, userId, updatedAt: toDate(data.updatedAt) } as Availability
}

export async function setAvailability(
  choirId: string,
  serviceId: string,
  userId: string,
  status: AvailabilityStatus,
  note?: string,
): Promise<void> {
  await setDoc(
    doc(db, 'choirs', choirId, 'services', serviceId, 'availability', userId),
    {
      choirId,
      serviceId,
      userId,
      status,
      note: note ?? null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

/** Availability lock: editable until 24h before the service */
export function isAvailabilityLocked(serviceDate: Date): boolean {
  const cutoff = new Date(serviceDate.getTime() - 24 * 60 * 60 * 1000)
  return new Date() >= cutoff
}
