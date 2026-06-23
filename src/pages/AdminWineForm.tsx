import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Wine, WineScores } from '../types/wine'
import type { useAuth } from '../hooks/useAuth'
import { CATEGORIES } from '../utils/categoryColors'
import { PROFILS } from '../utils/categoryColors'

interface Props {
  auth: ReturnType<typeof useAuth>
}

type FormData = Omit<Wine, 'id' | 'image_url' | 'image_source' | 'actif' | 'scores'>

const EMPTY: FormData = {
  categorie: 'Blancs',
  sous_region: '',
  reference: '',
  millesime: '',
  prix: 0,
  cepages: '',
  profil: null,
  explication_plancher: '',
  resume: '',
  vinif: '',
  fact: '',
}

const SCORE_LABELS: { key: keyof WineScores; label: string }[] = [
  { key: 'tannins',   label: 'Tanins' },
  { key: 'acidite',   label: 'Acidité' },
  { key: 'sucrosite', label: 'Sucrosité' },
  { key: 'corps',     label: 'Corps' },
  { key: 'bulles',    label: 'Bulles' },
  { key: 'nature',    label: 'Nature' },
]

const EMPTY_SCORES: WineScores = { tannins: 0, acidite: 0, sucrosite: 0, corps: 0, bulles: 0, nature: 0 }

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
        {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

export function AdminWineForm({ auth }: Props) {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [form, setForm] = useState<FormData>(EMPTY)
  const [scores, setScores] = useState<WineScores>(EMPTY_SCORES)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    fetch(`/api/admin/vins/${id}`, { headers: auth.authHeaders() })
      .then(r => r.json())
      .then((vin: Wine) => {
        setForm({
          categorie: vin.categorie,
          sous_region: vin.sous_region ?? '',
          reference: vin.reference,
          millesime: vin.millesime ?? '',
          prix: vin.prix,
          cepages: vin.cepages ?? '',
          profil: vin.profil,
          explication_plancher: vin.explication_plancher ?? '',
          resume: vin.resume ?? '',
          vinif: vin.vinif ?? '',
          fact: vin.fact ?? '',
        })
        setScores(vin.scores ? JSON.parse(vin.scores) : EMPTY_SCORES)
      })
      .finally(() => setLoading(false))
  }, [id, isEdit, auth])

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function setScore(key: keyof WineScores, value: number) {
    setScores(s => ({ ...s, [key]: value }))
  }

  async function handleRecalculate() {
    setRecalculating(true)
    const res = await fetch(`/api/admin/vins/${id}/scores`, {
      method: 'POST',
      headers: auth.authHeaders(),
    })
    if (res.ok) {
      const data = await res.json()
      setScores(data.scores)
    }
    setRecalculating(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = {
      ...form,
      sous_region: form.sous_region || null,
      millesime: form.millesime || null,
      profil: form.profil || null,
      ...(isEdit ? { scores: JSON.stringify(scores) } : {}),
    }

    const res = await fetch(
      isEdit ? `/api/admin/vins/${id}` : '/api/admin/vins',
      {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', ...auth.authHeaders() },
        body: JSON.stringify(payload),
      },
    )
    setSaving(false)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Une erreur est survenue')
      return
    }

    navigate('/admin')
  }

  const inputCls = 'input-base w-full px-3 py-2 rounded-lg border text-sm'
  const textareaCls = 'input-base w-full px-3 py-2 rounded-lg border text-sm resize-none'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <header className="sticky top-0 z-30 border-b" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1.5 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Retour
          </button>
          <span className="font-playfair font-bold italic" style={{ color: 'var(--accent)' }}>
            {isEdit ? 'Modifier le vin' : 'Ajouter un vin'}
          </span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Catégorie" required>
            <select value={form.categorie} onChange={e => set('categorie', e.target.value)} className={inputCls} required>
              {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Sous-région / Appellation">
            <input type="text" value={form.sous_region as string} onChange={e => set('sous_region', e.target.value)} className={inputCls} placeholder="Bourgogne, Loire…" />
          </Field>
        </div>

        <Field label="Référence (nom du vin)" required>
          <input type="text" value={form.reference} onChange={e => set('reference', e.target.value)} className={inputCls} required placeholder="Domaine, Cuvée, Appellation" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Millésime">
            <input type="number" value={form.millesime as string | number} onChange={e => set('millesime', e.target.value)} className={inputCls} placeholder="2022" min={1900} max={2030} />
          </Field>

          <Field label="Prix (CAD)" required>
            <input type="number" value={form.prix} onChange={e => set('prix', parseFloat(e.target.value))} className={inputCls} required step="0.01" min={0} placeholder="85" />
          </Field>

          <Field label="Profil">
            <select value={form.profil ?? ''} onChange={e => set('profil', (e.target.value as Wine['profil']) || null)} className={inputCls}>
              <option value="">— Aucun —</option>
              {Object.entries(PROFILS).map(([k, { label, icon }]) => (
                <option key={k} value={k}>{icon} {label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Cépage(s)" required>
          <input type="text" value={form.cepages as string} onChange={e => set('cepages', e.target.value)} className={inputCls} required placeholder="Chardonnay 70%, Pinot Blanc 30%" />
        </Field>

        <Field label="Explication plancher" required>
          <textarea value={form.explication_plancher as string} onChange={e => set('explication_plancher', e.target.value)} className={textareaCls} rows={3} required placeholder="Note interne pour les serveurs…" />
        </Field>

        <Field label="Résumé aromatique">
          <textarea value={form.resume as string} onChange={e => set('resume', e.target.value)} className={textareaCls} rows={4} placeholder="Description aromatique…" />
        </Field>

        <Field label="Vinification">
          <textarea value={form.vinif as string} onChange={e => set('vinif', e.target.value)} className={textareaCls} rows={5} placeholder="Détails de vinification…" />
        </Field>

        <Field label="Histoire du domaine">
          <textarea value={form.fact as string} onChange={e => set('fact', e.target.value)} className={textareaCls} rows={5} placeholder="Histoire du vigneron…" />
        </Field>

        {/* Score section — visible uniquement en mode édition */}
        {isEdit && (
          <div
            className="rounded-xl border p-4 space-y-3"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Profil sensoriel
              </p>
              <button
                type="button"
                onClick={handleRecalculate}
                disabled={recalculating}
                className="text-xs px-2.5 py-1 rounded-lg border disabled:opacity-50"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
              >
                {recalculating ? '…' : '⟳ Recalculer'}
              </button>
            </div>

            {SCORE_LABELS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs w-20 flex-shrink-0" style={{ color: 'var(--text)' }}>
                  {label}
                </span>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={scores[key]}
                  onChange={e => setScore(key, parseInt(e.target.value))}
                  className="flex-1 accent-[--accent]"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span
                  className="text-sm font-bold w-10 text-right flex-shrink-0 tabular-nums"
                  style={{ color: 'var(--accent)' }}
                >
                  {scores[key]}<span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>/10</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 border border-red-400/20 rounded-lg px-3 py-2" style={{ backgroundColor: '#ef444415' }}>
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2 pb-8">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer les modifications' : 'Ajouter le vin'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-5 py-3 rounded-xl text-sm font-medium border"
            style={{ color: 'var(--text)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
