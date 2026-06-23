import { CATEGORIES, CATEGORY_COLORS } from '../utils/categoryColors'

interface Props {
  selected: string
  onChange: (cat: string) => void
  counts: Record<string, number>
}

export function CategoryTabs({ selected, onChange, counts }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
      {CATEGORIES.map(cat => {
        const isActive = selected === cat
        const color = cat === 'Tous' ? 'var(--accent)' : (CATEGORY_COLORS[cat] ?? '#6B6560')
        const count = cat === 'Tous' ? undefined : counts[cat]

        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            style={
              isActive
                ? {
                    backgroundColor: color,
                    color: '#fff',
                    border: `1px solid ${color}`,
                  }
                : {
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }
            }
          >
            {cat}
            {count !== undefined && (
              <span className="ml-1.5 text-xs opacity-70">{count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
