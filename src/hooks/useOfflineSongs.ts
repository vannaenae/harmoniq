import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import type { OfflineSongMarker } from '@/types'

/**
 * Subscribe to the current user's offline-song markers.
 * Returns a Set of song IDs saved for offline use.
 */
export function useOfflineSongs(): Set<string> {
  const { firebaseUser } = useAuth()
  const [ids, setIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!firebaseUser) {
      setIds(new Set())
      return
    }

    const col = collection(db, 'users', firebaseUser.uid, 'offlineSongs')
    const unsub = onSnapshot(col, snap => {
      const next = new Set<string>()
      snap.forEach(d => {
        const data = d.data() as OfflineSongMarker
        next.add(data.songId)
      })
      setIds(next)
    })

    return unsub
  }, [firebaseUser])

  return ids
}
