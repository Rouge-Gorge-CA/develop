import { useEffect } from 'react'
import type { Filters } from '../types/wine'
import { FilterPanel } from './FilterPanel'

interface Props {
  open: boolean
  onClose: () => void
  filters: Filters
  onChange: (f: Filters) => void
  availableRegions: string[]
  onReset: () => void
  hasActiveFilters: boolean
}

export function FilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  availableRegions,
  onReset,
  hasActiveFilters,
}: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
            Filtres
          </h2>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={onReset}
                className="text-sm px-3 py-1 rounded-lg"
                style={{ color: 'var(--accent)', backgroundColor: 'var(--border)' }}
              >
                Effacer
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <FilterPanel filters={filters} onChange={onChange} availableRegions={availableRegions} />

        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-xl font-semibold text-sm text-white transition-opacity"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Voir les résultats
        </button>
      </div>
    </>
  )
}
