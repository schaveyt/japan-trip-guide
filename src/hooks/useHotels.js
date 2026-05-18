import { useState, useEffect } from 'react'
import { useAuth } from '../auth/useAuth'
import { api } from '../lib/api'

// Module-level cache — fetched once per session, shared across all hook instances
let cachedHotels = null

export function useHotels() {
  const { role } = useAuth()
  const [fetchedHotels, setFetchedHotels] = useState(cachedHotels ?? [])

  useEffect(() => {
    if (!role || cachedHotels !== null) return
    api.get('/api/hotels')
      .then(data => {
        cachedHotels = data
        setFetchedHotels(data)
      })
      .catch(() => setFetchedHotels([]))
  }, [role])

  // Derive empty array from role without setState — clears immediately on logout
  return role ? fetchedHotels : []
}
