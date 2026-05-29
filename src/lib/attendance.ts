import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toDate, listServices } from '@/lib/firestore'
import type { AttendanceRecord, AttendanceStatus, Service } from '@/types'

const attCol = (choirId: string, serviceId: string) =>
  collection(db, 'choirs', choirId, 'services', serviceId, 'attendance')

export async function getServiceAttendance(
  choirId: string,
  serviceId: string,
): Promise<Record<string, AttendanceRecord>> {
  const snap = await getDocs(attCol(choirId, serviceId))
  const map: Record<string, AttendanceRecord> = {}
  snap.docs.forEach(d => {
    const data = d.data()
    map[d.id] = { ...data, id: d.id, userId: d.id, updatedAt: toDate(data.updatedAt) } as AttendanceRecord
  })
  return map
}

export async function setAttendance(
  choirId: string,
  serviceId: string,
  userId: string,
  status: AttendanceStatus,
  updatedBy: string,
): Promise<void> {
  await setDoc(
    doc(db, 'choirs', choirId, 'services', serviceId, 'attendance', userId),
    { choirId, serviceId, userId, status, updatedBy, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

/** Attendance locks 24h AFTER the service starts. */
export function isAttendanceLocked(serviceDate: Date): boolean {
  return new Date() >= new Date(serviceDate.getTime() + 24 * 60 * 60 * 1000)
}

/** Derive a default attendance status from a member's availability RSVP. */
export function defaultFromAvailability(status?: string): AttendanceStatus {
  if (status === 'available') return 'present'
  if (status === 'unavailable') return 'unavailable'
  return 'absent'
}

export interface AttendanceHistoryEntry {
  service: Service
  status: AttendanceStatus | 'no_record'
}

/** A member's attendance across past services (most recent first), capped to `limit`. */
export async function getMemberAttendanceHistory(
  choirId: string,
  userId: string,
  limit = 10,
): Promise<AttendanceHistoryEntry[]> {
  const services = (await listServices(choirId))
    .filter(s => s.date < new Date())
    .sort((a, b) => +b.date - +a.date)
    .slice(0, limit)

  const entries = await Promise.all(
    services.map(async service => {
      const snap = await getDocs(attCol(choirId, service.id))
      const rec = snap.docs.find(d => d.id === userId)
      const status = (rec?.data().status as AttendanceStatus) ?? 'no_record'
      return { service, status }
    }),
  )
  return entries
}

/** Consecutive 'present' services from the most recent backwards. */
export function computeStreak(history: AttendanceHistoryEntry[]): number {
  let streak = 0
  for (const e of history) {
    if (e.status === 'present') streak++
    else if (e.status === 'unavailable') continue // excused doesn't break a streak
    else break
  }
  return streak
}
