import { useState, useEffect, useRef } from 'react'
import type { Wine } from '../../types/wine'
import type { useAuth } from '../../hooks/useAuth'
import { WineImage } from '../WineImage'

interface Props {
  wineId: number
  auth: ReturnType<typeof useAuth>
  onClose: () => void
  onSaved: () => void
}

interface SearchResult {
  url: string
  thumbnail: string
  title: string
}

export function ImageManager({ wineId, auth, onClose, onSaved }: Props) {
  const [wine, setWine] = useState<Wine | null>(null)
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [searchError, setSearchError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selecting, setSelecting] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/admin/vins/${wineId}`, { headers: auth.authHeaders() })
      .then(r => r.json())
      .then(setWine)
  }, [wineId, auth])

  async function handleSearch() {
    setSearching(true)
    setSearchError('')
    setResults([])
    const res = await fetch(`/api/admin/vins/${wineId}/image/search`, {
      method: 'POST',
      headers: auth.authHeaders(),
    })
    const body = await res.json()
    setSearching(false)
    if (!res.ok) {
      setSearchError(body.error)
    } else {
      setResults(body.results)
    }
  }

  async function handleSelectGoogle(url: string) {
    setSelecting(url)
    const res = await fetch(`/api/admin/vins/${wineId}/image/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.authHeaders() },
      body: JSON.stringify({ url }),
    })
    setSelecting(null)
    if (res.ok) onSaved()
    else {
      const b = await res.json()
      alert(b.error)
    }
  }

  async function handleUpload(file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append('image', file)
    const res = await fetch(`/api/admin/vins/${wineId}/image`, {
      method: 'POST',
      headers: auth.authHeaders(),
      body: fd,
    })
    setUploading(false)
    if (res.ok) onSaved()
    else {
      const b = await res.json()
      alert(b.error)
    }
  }

  async function handleRemove() {
    if (!confirm('Supprimer l\'image ?')) return
    await fetch(`/api/admin/vins/${wineId}/image`, { method: 'DELETE', headers: auth.authHeaders() })
    onSaved()
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div
          className="w-full max-w-lg rounded-2xl border overflow-hidden"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-playfair font-bold italic" style={{ color: 'var(--text)' }}>
              {wine?.reference ?? 'Image'}
            </h2>
            <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="flex items-start gap-4">
              <div className="w-20 h-28 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--border)' }}>
                {wine && <WineImage imageUrl={wine.image_url} categorie={wine.categorie} reference={wine.reference} />}
              </div>
              <div className="flex-1 space-y-2">
                {wine?.image_source && (
                  <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    Source : {wine.image_source === 'google' ? 'Google' : 'Upload manuel'}
                  </span>
                )}
                {!wine?.image_url && (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aucune image</p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    {uploading ? 'Upload…' : 'Uploader une photo'}
                  </button>
                  <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                    style={{ color: 'var(--text)', borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
                  >
                    {searching ? 'Recherche…' : 'Chercher sur Google'}
                  </button>
                  {wine?.image_url && (
                    <button
                      onClick={handleRemove}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ color: '#f87171', backgroundColor: '#ef444415' }}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) handleUpload(f)
              }}
            />

            {searchError && (
              <p className="text-xs text-red-400 border border-red-400/20 rounded-lg px-3 py-2" style={{ backgroundColor: '#ef444415' }}>
                {searchError}
              </p>
            )}

            {results.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                  Résultats Google
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {results.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectGoogle(r.url)}
                      disabled={selecting !== null}
                      className="relative rounded-xl overflow-hidden aspect-[3/4] border transition-all hover:ring-2 disabled:opacity-60"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {selecting === r.url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        </div>
                      )}
                      <img
                        src={r.thumbnail}
                        alt={r.title}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
