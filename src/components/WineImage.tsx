import { CATEGORY_COLORS } from '../utils/categoryColors'

interface Props {
  imageUrl: string | null
  categorie: string
  reference: string
}

export function WineImage({ imageUrl, categorie, reference }: Props) {
  const color = CATEGORY_COLORS[categorie] ?? '#6B6560'

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={reference}
        className="w-full h-full object-contain"
        onError={e => {
          const target = e.currentTarget as HTMLImageElement
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) parent.setAttribute('data-fallback', 'true')
        }}
      />
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
      <svg width="28" height="44" viewBox="0 0 28 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 2 L10 10 C10 14 4 18 4 26 C4 34 8 42 14 42 C20 42 24 34 24 26 C24 18 18 14 18 10 L18 2 Z"
          stroke={color}
          strokeWidth="1.5"
          fill={`${color}25`}
          strokeLinejoin="round"
        />
        <line x1="10" y1="2" x2="18" y2="2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 24 Q14 20 21 24" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      </svg>
    </div>
  )
}
