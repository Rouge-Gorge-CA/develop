import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Wine } from '../types/wine'
import type { useAuth } from '../hooks/useAuth'
import { BadgeCategorie } from '../components/BadgeCategorie'
import { WineImage } from '../components/WineImage'
import { ThemeToggle } from '../components/ThemeToggle'
import { formatMillesime, formatPrix } from '../utils/normalize'
import { CATEGORIES } from '../utils/categoryColors'
import { ImportExcel } from '../components/admin/ImportExcel'
import { ImageManager } from '../components/admin/ImageManager'

interface Props {
  auth: ReturnType<typeof useAuth>
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

interface Stats {
  total: number
  noImage: number
  archived: number
}

interface PageData {
  vins: Wine[]
  total: number
  page: number
  limit: number
}

export function AdminDashboard({ auth, theme, onToggleTheme }: Props) {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [data, setData] = useState<PageData | null>(null)
  const [query, setQuery] = useState('')
  const [categorie, setCategorie] = useState('Tous')
  const [showArchived, setShowArchived] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [imageManagerId, setImageManagerId] = useState<number | null>(null)

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/admin/stats', { headers: auth.authHeaders() })
    if (res.ok) setStats(await res.json())
  }, [auth])

  const fetchVins = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (query) params.set('q', query)
    if (categorie !== 'Tous') params.set('categorie', categorie)
    if (showArchived) {
      params.set('actif', '0')
    } else {
      params.set('actif', '1')
    }
    const res = await fetch(`/api/admin/vins?${params}`, { headers: auth.authHeaders() })
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [auth, query, categorie, showArchived, page])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { setPage(1) }, [query, categorie, showArchived])
  useEffect(() => { fetchVins() }, [fetchVins])

  async function handleArchive(id: number) {
    if (!confirm('Archiver ce vin ?')) return
    await fetch(`/api/admin/vins/${id}`, { method: 'DELETE', headers: auth.authHeaders() })
    fetchVins()
    fetchStats()
  }

  async function handleRestore(id: number) {
    await fetch(`/api/admin/vins/${id}/restore`, { method: 'POST', headers: auth.authHeaders() })
    fetchVins()
    fetchStats()
  }

  async function handleRecalculateScore(id: number) {
    await fetch(`/api/admin/vins/${id}/scores`, { method: 'POST', headers: auth.authHeaders() })
    fetchVins()
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <header
        className="sticky top-0 z-30 border-b"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3">
          <img src="/logo.jpg" alt="Rouge-Gorge" className="rounded-full object-cover flex-shrink-0" style={{ width: 36, height: 36 }} />
          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}>
            Admin
          </span>
          <div className="flex-1" />
          <a href="/" className="text-sm hidden sm:block" style={{ color: 'var(--text-muted)' }}>
            Voir la carte →
          </a>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            onClick={() => { auth.logout(); navigate('/admin/login') }}
            className="text-sm px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Vins actifs', value: stats.total },
              { label: 'Sans image', value: stats.noImage, warn: stats.noImage > 0 },
              { label: 'Archivés', value: stats.archived },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-xl border p-4 text-center"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <p
                  className="font-playfair font-bold text-2xl"
                  style={{ color: s.warn ? '#C4855A' : 'var(--text)' }}
                >
                  {s.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/admin/vins/nouveau')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <span>+</span> Ajouter un vin
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border"
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text)', borderColor: 'var(--border)' }}
          >
            Importer Excel
          </button>
          <button
            onClick={() => { setShowArchived(a => !a); setCategorie('Tous') }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border"
            style={{
              backgroundColor: showArchived ? 'var(--border)' : 'var(--bg-card)',
              color: 'var(--text)',
              borderColor: 'var(--border)',
            }}
          >
            {showArchived ? 'Voir actifs' : 'Voir archivés'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ color: 'var(--text-muted)' }}
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="input-base w-full pl-9 pr-3 py-2 rounded-lg border text-sm"
            />
          </div>
          <select
            value={categorie}
            onChange={e => setCategorie(e.target.value)}
            className="input-base px-3 py-2 rounded-lg border text-sm"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: 'var(--border)' }}
        >
          {loading && (
            <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
              Chargement…
            </div>
          )}

          {!loading && data?.vins.length === 0 && (
            <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
              Aucun vin trouvé
            </div>
          )}

          {!loading && data && data.vins.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-widest" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}>
                  <th className="px-4 py-3 w-12"></th>
                  <th className="px-4 py-3">Référence</th>
                  <th className="px-4 py-3 hidden md:table-cell">Catégorie</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Cépage</th>
                  <th className="px-4 py-3">Prix</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.vins.map((vin, i) => (
                  <tr
                    key={vin.id}
                    className="border-b last:border-0 transition-colors"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg)',
                    }}
                  >
                    <td className="px-3 py-2">
                      <div className="w-9 h-12 rounded overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--border)' }}>
                        <WineImage imageUrl={vin.image_url} categorie={vin.categorie} reference={vin.reference} />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <p className="font-playfair italic font-bold text-sm leading-tight" style={{ color: 'var(--text)' }}>
                        {vin.reference}
                        {vin.millesime && (
                          <span className="not-italic font-normal ml-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                            {formatMillesime(vin.millesime)}
                          </span>
                        )}
                      </p>
                      {vin.sous_region && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{vin.sous_region}</p>
                      )}
                      <span
                        className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={vin.scores
                          ? { color: '#4ade80', backgroundColor: '#4ade8015', border: '1px solid #4ade8030' }
                          : { color: 'var(--text-muted)', backgroundColor: 'var(--border)' }
                        }
                      >
                        {vin.scores ? '✓ Scores générés' : 'Scores manquants'}
                      </span>
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell">
                      <BadgeCategorie categorie={vin.categorie} size="xs" />
                    </td>
                    <td className="px-4 py-2 hidden lg:table-cell">
                      <span className="text-xs truncate max-w-[180px] block" style={{ color: 'var(--text-muted)' }}>
                        {vin.cepages}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="font-playfair font-bold text-sm" style={{ color: 'var(--accent)' }}>
                        {vin.prix ? formatPrix(vin.prix) : '–'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setImageManagerId(vin.id)}
                          className="p-1.5 rounded-lg text-xs"
                          style={{ color: 'var(--text-muted)', backgroundColor: 'var(--border)' }}
                          title="Gérer l'image"
                        >
                          🖼
                        </button>
                        {showArchived ? (
                          <button
                            onClick={() => handleRestore(vin.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium"
                            style={{ color: '#4ade80', backgroundColor: '#4ade8022', border: '1px solid #4ade8044' }}
                          >
                            Restaurer
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRecalculateScore(vin.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium"
                              style={{ color: 'var(--text-muted)', backgroundColor: 'var(--border)' }}
                              title="Recalculer les scores"
                            >
                              ⟳
                            </button>
                            <button
                              onClick={() => navigate(`/admin/vins/${vin.id}/modifier`)}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium"
                              style={{ color: 'var(--accent)', backgroundColor: `var(--border)` }}
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleArchive(vin.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium"
                              style={{ color: 'var(--text-muted)', backgroundColor: 'var(--border)' }}
                            >
                              Archiver
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {data && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              ←
            </button>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              →
            </button>
          </div>
        )}
      </div>

      {showImport && (
        <ImportExcel
          auth={auth}
          onClose={() => setShowImport(false)}
          onDone={() => { fetchVins(); fetchStats(); setShowImport(false) }}
        />
      )}

      {imageManagerId !== null && (
        <ImageManager
          wineId={imageManagerId}
          auth={auth}
          onClose={() => setImageManagerId(null)}
          onSaved={() => { fetchVins(); setImageManagerId(null) }}
        />
      )}
    </div>
  )
}
