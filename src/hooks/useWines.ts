import { useState, useEffect } from 'react'
import type { Wine } from '../types/wine'

export function useWines() {
  const [wines, setWines] = useState<Wine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/vins')
      .then(r => {
        if (!r.ok) throw new Error('api-unavailable')
        return r.json() as Promise<Wine[]>
      })
      .catch(() =>
        // Fallback vers le fichier statique tant que le backend n'est pas déployé
        fetch('/wines.json').then(r => r.json() as Promise<Wine[]>)
      )
      .then((data: Wine[]) => {
        setWines(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Impossible de charger les vins')
        setLoading(false)
      })
  }, [])

  return { wines, loading, error }
}
