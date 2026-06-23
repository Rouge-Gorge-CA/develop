import { useState, useEffect } from 'react'
import type { Wine } from '../types/wine'

export function useWines() {
  const [wines, setWines] = useState<Wine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/vins')
      .then(r => {
        if (!r.ok) throw new Error('Impossible de charger les vins')
        return r.json()
      })
      .then((data: Wine[]) => {
        setWines(data)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  return { wines, loading, error }
}
