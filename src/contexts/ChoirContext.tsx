import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { countUnread } from '@/lib/notifications'
import type { Choir, ChoirMember } from '@/types'

interface ChoirContextValue {
  choir: Choir | null
  members: ChoirMember[]
  loading: boolean
  isDirector: boolean
  unreadCount: number
  refreshChoir: () => Promise<void>
  refreshMembers: () => Promise<void>
  refreshUnread: () => Promise<void>
}

const ChoirContext = createContext<ChoirContextValue | null>(null)

function coerceDate(v: unknown): Date {
  if (!v) return new Date()
  if (v instanceof Date) return v
  // Firestore Timestamp
  if (typeof v === 'object' && v !== null && 'toDate' in v) {
    return (v as { toDate: () => Date }).toDate()
  }
  return new Date(v as string)
}

export function ChoirProvider({ children }: { children: ReactNode }) {
  const { harmonicUser, firebaseUser } = useAuth()
  const choirId = harmonicUser?.choirId
  const [choir, setChoir] = useState<Choir | null>(null)
  const [members, setMembers] = useState<ChoirMember[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const refreshUnread = useCallback(async () => {
    if (!choirId || !firebaseUser) { setUnreadCount(0); return }
    try { setUnreadCount(await countUnread(choirId, firebaseUser.uid)) }
    catch { setUnreadCount(0) }
  }, [choirId, firebaseUser])

  const refreshChoir = useCallback(async () => {
    if (!choirId) {
      setChoir(null)
      return
    }
    const snap = await getDoc(doc(db, 'choirs', choirId))
    if (snap.exists()) {
      const data = snap.data()
      setChoir({
        ...data,
        id: snap.id,
        createdAt: coerceDate(data.createdAt),
        updatedAt: coerceDate(data.updatedAt),
        inviteExpiry: coerceDate(data.inviteExpiry),
      } as Choir)
    }
  }, [choirId])

  const refreshMembers = useCallback(async () => {
    if (!choirId) {
      setMembers([])
      return
    }
    const snap = await getDocs(collection(db, 'choirs', choirId, 'members'))
    setMembers(
      snap.docs.map(d => {
        const data = d.data()
        return { ...data, uid: d.id, joinedAt: coerceDate(data.joinedAt) } as ChoirMember
      })
    )
  }, [choirId])

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([refreshChoir(), refreshMembers(), refreshUnread()]).finally(() => {
      if (active) setLoading(false)
    })
    return () => {
      active = false
    }
  }, [refreshChoir, refreshMembers, refreshUnread])

  return (
    <ChoirContext.Provider
      value={{
        choir,
        members,
        loading,
        isDirector: harmonicUser?.role === 'director',
        unreadCount,
        refreshChoir,
        refreshMembers,
        refreshUnread,
      }}
    >
      {children}
    </ChoirContext.Provider>
  )
}

export function useChoir() {
  const ctx = useContext(ChoirContext)
  if (!ctx) throw new Error('useChoir must be used inside ChoirProvider')
  return ctx
}
