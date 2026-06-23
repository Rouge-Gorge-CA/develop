import { PROFILS, PRICE_RANGES } from '../utils/categoryColors'
import type { Filters, PriceRange } from '../types/wine'

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  availableRegions: string[]
}

export function FilterPanel({ filters, onChange, availableRegions }: Props) {
  function toggleProfil(p: string) {
    const next = filters.profils.includes(p)
      ? filters.profils.filter(x => x !== p)
      : [...filters.profils, p]
    onChange({ ...filters, profils: next })
  }

  return (
    <div className="space-y-5">
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-muted)' }}>
          Profil
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PROFILS).map(([key, { label, icon }]) => {
            const active = filters.profils.includes(key)
            return (
              <button
                key={key}
                onClick={() => toggleProfil(key)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  active
                    ? { backgroundColor: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' }
                    : { backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                }
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-muted)' }}>
          Prix
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_RANGES.map(({ value, label }) => {
            const active = filters.priceRange === value
            return (
              <button
                key={value}
                onClick={() => onChange({ ...filters, priceRange: value as PriceRange })}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={
                  active
                    ? { backgroundColor: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' }
                    : { backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                }
              >
                {label}
              </button>
            )
          })}
        </div>
      </section>

      {availableRegions.length > 2 && (
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-muted)' }}>
            Région
          </p>
          <select
            value={filters.region}
            onChange={e => onChange({ ...filters, region: e.target.value })}
            className="input-base w-full px-3 py-1.5 rounded-lg border text-sm"
          >
            {availableRegions.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </section>
      )}

      <section>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-muted)' }}>
          Cépage
        </p>
        <div className="relative">
          <input
            type="text"
            value={filters.cepage}
            onChange={e => onChange({ ...filters, cepage: e.target.value })}
            placeholder="Chardonnay, Pinot Noir…"
            className="input-base w-full px-3 py-1.5 rounded-lg border text-sm"
          />
          {filters.cepage && (
            <button
              onClick={() => onChange({ ...filters, cepage: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
