import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { generateId } from '@/lib/utils'
import type { Service, SetListItem } from '@/types'

/** Normalise a Firestore Timestamp/Date/string into a Date */
export function toDate(v: unknown): Date {
  if (!v) return new Date()
  if (v instanceof Date) return v
  if (typeof v === 'object' && v !== null && 'toDate' in v) {
    return (v as { toDate: () => Date }).toDate()
  }
  return new Date(v as string)
}

// ── Services ──────────────────────────────────────────────────────────────────

const servicesCol = (choirId: string) => collection(db, 'choirs', choirId, 'services')

export async function listServices(choirId: string): Promise<Service[]> {
  const snap = await getDocs(query(servicesCol(choirId), orderBy('date', 'asc')))
  return snap.docs.map(d => {
    const data = d.data()
    return {
      ...data,
      id: d.id,
      date: toDate(data.date),
      availabilityDeadline: data.availabilityDeadline ? toDate(data.availabilityDeadline) : undefined,
      setListDeadline: data.setListDeadline ? toDate(data.setListDeadline) : undefined,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    } as Service
  })
}

/** Real-time listener for the services collection. Returns unsubscribe function. */
export function subscribeServices(
  choirId: string,
  callback: (services: Service[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(servicesCol(choirId), orderBy('date', 'asc'))
  return onSnapshot(
    q,
    snap => {
      callback(
        snap.docs.map(d => {
          const data = d.data()
          return {
            ...data,
            id: d.id,
            date: toDate(data.date),
            availabilityDeadline: data.availabilityDeadline ? toDate(data.availabilityDeadline) : undefined,
            setListDeadline: data.setListDeadline ? toDate(data.setListDeadline) : undefined,
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
          } as Service
        }),
      )
    },
    onError,
  )
}

export async function getService(choirId: string, serviceId: string): Promise<Service | null> {
  const snap = await getDoc(doc(db, 'choirs', choirId, 'services', serviceId))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    ...data,
    id: snap.id,
    date: toDate(data.date),
    availabilityDeadline: data.availabilityDeadline ? toDate(data.availabilityDeadline) : undefined,
    setListDeadline: data.setListDeadline ? toDate(data.setListDeadline) : undefined,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as Service
}

export interface ServiceInput {
  title: string
  serviceType?: import('@/types').ServiceType
  date: Date
  time?: string
  theme?: string
  scriptureRef?: string
  status: Service['status']
  availabilityDeadline?: Date
  setListDeadline?: Date
  calendarSync?: boolean
}

export async function createService(
  choirId: string,
  createdBy: string,
  input: ServiceInput,
): Promise<string> {
  const id = generateId()
  await setDoc(doc(db, 'choirs', choirId, 'services', id), {
    id,
    choirId,
    title: input.title,
    serviceType: input.serviceType ?? null,
    date: input.date,
    time: input.time ?? null,
    theme: input.theme ?? null,
    scriptureRef: input.scriptureRef ?? null,
    status: input.status,
    availabilityDeadline: input.availabilityDeadline ?? null,
    setListDeadline: input.setListDeadline ?? null,
    calendarSync: input.calendarSync ?? false,
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return id
}

export async function updateService(
  choirId: string,
  serviceId: string,
  input: Partial<ServiceInput>,
): Promise<void> {
  await updateDoc(doc(db, 'choirs', choirId, 'services', serviceId), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteService(choirId: string, serviceId: string): Promise<void> {
  await deleteDoc(doc(db, 'choirs', choirId, 'services', serviceId))
}

// ── Set list (subcollection of a service) ──────────────────────────────────────

const setlistCol = (choirId: string, serviceId: string) =>
  collection(db, 'choirs', choirId, 'services', serviceId, 'setlist')

export async function getSetList(choirId: string, serviceId: string): Promise<SetListItem[]> {
  const snap = await getDocs(query(setlistCol(choirId, serviceId), orderBy('order', 'asc')))
  return snap.docs.map(d => ({ ...d.data(), songId: d.id }) as SetListItem)
}

/** Replace the entire set list with the provided ordered items */
export async function saveSetList(
  choirId: string,
  serviceId: string,
  items: SetListItem[],
): Promise<void> {
  // Delete removed items, then upsert current ones with their order
  const existing = await getDocs(setlistCol(choirId, serviceId))
  const keepIds = new Set(items.map(i => i.songId))
  await Promise.all(
    existing.docs
      .filter(d => !keepIds.has(d.id))
      .map(d => deleteDoc(d.ref))
  )
  await Promise.all(
    items.map((item, idx) =>
      setDoc(doc(db, 'choirs', choirId, 'services', serviceId, 'setlist', item.songId), {
        ...item,
        order: idx,
      })
    )
  )
}
