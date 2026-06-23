export const CATEGORY_COLORS: Record<string, string> = {
  Bulles: '#C9A84C',
  Blancs: '#D4C27A',
  Orange: '#C4855A',
  Rosé: '#C47A85',
  Rouges: '#8B2635',
  'Grand Formats': '#5C4A7A',
  'Hors Carte': '#6B6560',
}

export const CATEGORIES = ['Tous', 'Bulles', 'Blancs', 'Orange', 'Rosé', 'Rouges', 'Grand Formats', 'Hors Carte']

export const PRICE_RANGES = [
  { value: 'all', label: 'Tous les prix' },
  { value: 'lt70', label: '< 70 $' },
  { value: '70-100', label: '70 – 100 $' },
  { value: '100-150', label: '100 – 150 $' },
  { value: '150-250', label: '150 – 250 $' },
  { value: 'gt250', label: '250 $+' },
] as const

export const PROFILS = {
  natty_clean: { label: 'Natty Clean', icon: '🌿' },
  natty_zero: { label: 'Natty Zéro Zéro', icon: '🧪' },
  low_intervention: { label: 'Low Intervention', icon: '🌱' },
  classique: { label: 'Classique', icon: '🏛️' },
} as const
