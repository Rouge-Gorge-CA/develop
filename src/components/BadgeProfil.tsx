import { PROFILS } from '../utils/categoryColors'

interface Props {
  profil: string
  size?: 'sm' | 'xs'
}

export function BadgeProfil({ profil, size = 'sm' }: Props) {
  const info = PROFILS[profil as keyof typeof PROFILS]
  if (!info) return null

  const px = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-inter font-medium uppercase tracking-widest ${px}`}
      style={{
        backgroundColor: 'var(--border)',
        color: 'var(--text-muted)',
        border: '1px solid var(--border-strong)',
      }}
    >
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </span>
  )
}
