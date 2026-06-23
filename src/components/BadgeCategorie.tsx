import { CATEGORY_COLORS } from '../utils/categoryColors'

interface Props {
  categorie: string
  size?: 'sm' | 'xs'
}

export function BadgeCategorie({ categorie, size = 'sm' }: Props) {
  const color = CATEGORY_COLORS[categorie] ?? '#6B6560'
  const px = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'

  return (
    <span
      className={`inline-block rounded font-inter font-medium uppercase tracking-widest ${px}`}
      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {categorie}
    </span>
  )
}
