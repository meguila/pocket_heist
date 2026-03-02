import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUser } from '@/hooks/useUser'
import { Heist, heistConverter, COLLECTIONS } from '@/types/firestore'

export type HeistMode = 'active' | 'assigned' | 'expired'

export type UseHeistsResult = {
  data: Heist[]
  error: Error | null
  loading: boolean
}

export function useHeists(mode: HeistMode): UseHeistsResult {
  const { user, isLoading } = useUser()
  const [data, setData] = useState<Heist[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoading || !user) return

    const now = new Date()
    const colRef = collection(db, COLLECTIONS.HEISTS).withConverter(heistConverter)

    let q
    if (mode === 'active') {
      q = query(colRef, where('assignedTo', '==', user.uid), where('deadline', '>', now))
    } else if (mode === 'assigned') {
      q = query(colRef, where('createdBy', '==', user.uid), where('deadline', '>', now))
    } else {
      q = query(colRef, where('deadline', '<=', now), where('finalStatus', '!=', null))
    }

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setData(snapshot.docs.map((doc) => doc.data()))
        setError(null)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    return unsub
  }, [mode, user, isLoading])

  if (!isLoading && !user) {
    return { data: [], error: null, loading: false }
  }

  return { data, error, loading }
}
