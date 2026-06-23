import { useState, useMemo, useCallback } from 'react'
import type { Filters, SortOption } from '../types/wine'
import { useWines } from '../hooks/useWines'
import { useFilteredWines } from '../hooks/useFilteredWines'
import { SearchBar } from '../components/SearchBar'
import { CategoryTabs } from '../components/CategoryTabs'
import { FilterPanel } from '../components/FilterPanel'
import { FilterDrawer } from '../components/FilterDrawer'
import { ThemeToggle } from '../components/ThemeToggle'
import { WineCard } from '../components/WineCard'
import { CATEGORIES } from '../utils/categoryColors'

const DEFAULT_FILTERS: Filters = {
  categorie: 'Tous',
  profils: [],
  priceRange: 'all',
  region: 'Toutes',
  cepage: '',
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'alpha', label: 'A → Z' },
  { value: 'prix_asc', label: 'Prix ↑' },
  { value: 'prix_desc', label: 'Prix ↓' },
  { value: 'categorie', label: 'Catégorie' },
]

interface Props {
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export function Home({ theme, onToggleTheme }: Props) {
  const { wines, loading, error } = useWines()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState<SortOption>('alpha')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { filtered, availableRegions, hasActiveFilters } = useFilteredWines(wines, query, filters, sortBy)

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const cat of CATEGORIES.slice(1)) {
      counts[cat] = wines.filter(w => w.categorie === cat).length
    }
    return counts
  }, [wines])

  const handleReset = useCallback(() => {
    setQuery('')
    setFilters(DEFAULT_FILTERS)
    setSortBy('alpha')
  }, [])

  const handleToggle = useCallback((id: number) => {
    setExpandedId(prev => (prev === id ? null : id))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="text-center space-y-3">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent mx-auto animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Chargement de la carte…
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Erreur : {error}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <header
        className="sticky top-0 z-30 border-b"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-shrink-0">
            <img src="/logo.jpg" alt="Rouge-Gorge" className="rounded-full object-cover" style={{ width: 36, height: 36 }} />
          </div>

          <SearchBar value={query} onChange={setQuery} />

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0 pt-5">
            <div
              className="sticky top-[65px] rounded-xl border p-4 space-y-1"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
                Filtres
              </p>
              <FilterPanel filters={filters} onChange={setFilters} availableRegions={availableRegions} />
              {hasActiveFilters && (
                <button
                  onClick={handleReset}
                  className="mt-4 w-full py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                  style={{ color: 'var(--accent)', border: '1px solid var(--border)' }}
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          </aside>

          <main className="flex-1 min-w-0 pt-4 pb-8">
            <div className="mb-3">
              <CategoryTabs
                selected={filters.categorie}
                onChange={cat => setFilters(f => ({ ...f, categorie: cat, region: 'Toutes' }))}
                counts={categoryCounts}
              />
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm flex-1" style={{ color: 'var(--text-muted)' }}>
                <span className="font-semibold" style={{ color: 'var(--text)' }}>
                  {filtered.length}
                </span>{' '}
                {filtered.length === 1 ? 'vin' : 'vins'}
              </span>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="input-base px-2.5 py-1 rounded-lg border text-sm"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: hasActiveFilters ? 'var(--accent)' : 'var(--bg-card)',
                  color: hasActiveFilters ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                  <line x1="11" y1="18" x2="13" y2="18" />
                </svg>
                Filtres
                {hasActiveFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            </div>

            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg font-playfair italic mb-2" style={{ color: 'var(--text-muted)' }}>
                  Aucun vin trouvé
                </p>
                <button onClick={handleReset} className="text-sm" style={{ color: 'var(--accent)' }}>
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {filtered.map(wine => (
                  <div
                    key={wine.id}
                    className={expandedId === wine.id ? 'xl:col-span-2' : ''}
                  >
                    <WineCard
                      wine={wine}
                      isExpanded={expandedId === wine.id}
                      onToggle={() => handleToggle(wine.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        availableRegions={availableRegions}
        onReset={handleReset}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  )
}
