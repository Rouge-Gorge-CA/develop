import { useState, useRef } from 'react'
import type { useAuth } from '../../hooks/useAuth'

interface Props {
  auth: ReturnType<typeof useAuth>
  onClose: () => void
  onDone: () => void
}

interface ImportResult {
  added: number
  updated: number
  archived: number
  errors: string[]
}

export function ImportExcel({ auth, onClose, onDone }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setLoading(true)
    setError('')
    setResult(null)

    const fd = new FormData()
    fd.append('excel', file)

    const res = await fetch('/api/admin/import-excel', {
      method: 'POST',
      headers: auth.authHeaders(),
      body: fd,
    })
    const body = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(body.error ?? 'Erreur d\'import')
    } else {
      setResult(body)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Import Excel</h2>
            <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="p-5 space-y-4">
            {!result ? (
              <>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Les vins existants (même référence + millésime) seront mis à jour.
                  Les nouveaux seront ajoutés. Les absents seront archivés.
                </p>

                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={loading}
                  className="w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-colors disabled:opacity-50"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                      <span className="text-sm">Import en cours…</span>
                    </>
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span className="text-sm font-medium">Sélectionner le fichier .xlsx</span>
                      <span className="text-xs">Liste_Vin_RG.xlsx</span>
                    </>
                  )}
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) handleFile(f)
                  }}
                />

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Ajoutés', value: result.added, color: '#4ade80' },
                    { label: 'Mis à jour', value: result.updated, color: 'var(--accent)' },
                    { label: 'Archivés', value: result.archived, color: 'var(--text-muted)' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--border)' }}>
                      <p className="font-playfair font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {result.errors.length > 0 && (
                  <div className="text-xs space-y-1 text-red-400">
                    {result.errors.map((e, i) => <p key={i}>{e}</p>)}
                  </div>
                )}

                <button
                  onClick={onDone}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Fermer
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
