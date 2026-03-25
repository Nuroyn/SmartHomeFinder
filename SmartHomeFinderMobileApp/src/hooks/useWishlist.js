import { useCallback, useEffect, useState } from 'react'
import { wishlistService } from '../services/wishlistService'
import { useAuth } from './useAuth'

export function useWishlist() {
  const { isLoggedIn } = useAuth()
  const [ids, setIds] = useState([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!isLoggedIn) {
      setIds([])
      return
    }
    setLoading(true)
    try {
      const data = await wishlistService.fetchIds()
      setIds(data.wishlistIds ?? data.ids ?? [])
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    refresh()
  }, [refresh])

  const toggle = useCallback(
    async (propertyId) => {
      const exists = ids.includes(propertyId)
      // Optimistic update
      setIds((prev) => (exists ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]))
      try {
        if (exists) {
          await wishlistService.remove(propertyId)
        } else {
          await wishlistService.add(propertyId)
        }
      } catch {
        // Revert on failure
        setIds((prev) =>
          exists ? [...prev, propertyId] : prev.filter((id) => id !== propertyId),
        )
      }
    },
    [ids],
  )

  const isWishlisted = useCallback((propertyId) => ids.includes(propertyId), [ids])

  return { ids, loading, toggle, isWishlisted, refresh }
}
