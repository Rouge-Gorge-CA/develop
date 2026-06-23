import { useState } from 'react'
import type { Wine, WineScores } from '../types/wine'
import { BadgeCategorie } from './BadgeCategorie'
import { BadgeProfil } from './BadgeProfil'
import { WineImage } from './WineImage'
import { formatMillesime, formatPrix } from '../utils/normalize'

interface Props {
  wine: Wine
  isExpanded: boolean
  onToggle: () => void
}

const SCORE_LABELS: Record<keyof WineScores, string> = {
  tannins: 'Tanins',
  acidite: 'Acidité',
  sucrosite: 'Sucrosité',
  corps: 'Corps',
  bulles: 'Bulles',
  nature: 'Nature',
}

function ScoreGauges({ scores }: { scores: WineScores }) {
  const entries = (Object.keys(SCORE_LABELS) as (keyof WineScores)[]).filter(k => scores[k] > 0)
  if (entries.length === 0) return null
  return (
    <div className="border-t pt-3 pb-1 space-y-1.5" style={{ borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
        Profil sensoriel
      </p>
      {entries.map(key => (
        <div key={key} className="flex items-center gap-2">
          <span className="text-xs w-16 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
            {SCORE_LABELS[key]}
          </span>
          <div className="flex-1 rounded-full overflow-hidden" style={{ height: 5, backgroundColor: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(scores[key] / 10) * 100}%`,
                backgroundColor: 'var(--accent)',
                opacity: 0.75 + scores[key] * 0.05,
              }}
            />
          </div>
          <span className="text-xs w-8 flex-shrink-0 text-right" style={{ color: 'var(--text-muted)' }}>
            {scores[key]}/10
          </span>
        </div>
      ))}
    </div>
  )
}

function Accordion({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false)
  if (!content?.trim()) return null

  return (
    <div className="border-t" style={{ borderColor: 'var(--border)' }}>
      <button
        onClick={e => {
          e.stopPropagation()
          setOpen(o => !o)
        }}
        className="w-full flex items-center justify-between py-2.5 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {title}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            color: 'var(--text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <p className="text-sm pb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {content}
        </p>
      )}
    </div>
  )
}

export function WineCard({ wine, isExpanded, onToggle }: Props) {
  const millesime = formatMillesime(wine.millesime)
  const scores: WineScores | null = wine.scores ? JSON.parse(wine.scores) : null

  return (
    <article
      onClick={onToggle}
      className="card-bg rounded-xl border cursor-pointer transition-colors"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex gap-3 p-3">
        <div
          className="flex-shrink-0 rounded-lg overflow-hidden"
          style={{ width: 60, height: 80, backgroundColor: 'var(--border)' }}
        >
          <WineImage imageUrl={wine.image_url} categorie={wine.categorie} reference={wine.reference} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="font-playfair font-bold italic text-sm leading-snug" style={{ color: 'var(--text)' }}>
              {wine.reference}
              {millesime && (
                <span className="not-italic font-normal ml-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {millesime}
                </span>
              )}
            </h2>
            <span className="font-playfair font-bold text-sm flex-shrink-0" style={{ color: 'var(--accent)' }}>
              {formatPrix(wine.prix)}
            </span>
          </div>

          <div className="flex flex-wrap gap-1 mb-1.5">
            <BadgeCategorie categorie={wine.categorie} size="xs" />
            {wine.sous_region && wine.sous_region !== wine.categorie && (
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--border)' }}>
                {wine.sous_region}
              </span>
            )}
            {wine.profil && <BadgeProfil profil={wine.profil} size="xs" />}
          </div>

          {wine.cepages && (
            <p className="text-xs mb-1.5 truncate" style={{ color: 'var(--text-muted)' }}>
              {wine.cepages}
            </p>
          )}

          {wine.explication_plancher?.trim() && (
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>
              {wine.explication_plancher}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 self-start mt-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              color: 'var(--text-muted)',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.25s',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div
          className="px-3 pb-3"
          onClick={e => e.stopPropagation()}
        >
          {scores && <ScoreGauges scores={scores} />}

          {wine.resume?.trim() && (
            <div className="border-t pt-3 pb-1" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Résumé aromatique
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                {wine.resume}
              </p>
            </div>
          )}

          <Accordion title="Vinification" content={wine.vinif} />
          <Accordion title="Histoire du domaine" content={wine.fact} />
        </div>
      )}
    </article>
  )
}
