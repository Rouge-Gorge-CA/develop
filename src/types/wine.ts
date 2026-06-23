export interface WineScores {
  tannins: number
  acidite: number
  sucrosite: number
  corps: number
  bulles: number
  nature: number
}

export interface Wine {
  id: number
  categorie: string
  sous_region: string | null
  reference: string
  millesime: string | number
  prix: number
  cepages: string
  profil: 'natty_clean' | 'natty_zero' | 'low_intervention' | 'classique' | null
  explication_plancher: string
  resume: string
  vinif: string
  fact: string
  image_url: string | null
  image_source: 'google' | 'upload' | null
  actif: number
  scores: string | null
}

export type SortOption = 'alpha' | 'prix_asc' | 'prix_desc' | 'categorie'

export type PriceRange = 'all' | 'lt70' | '70-100' | '100-150' | '150-250' | 'gt250'

export interface Filters {
  categorie: string
  profils: string[]
  priceRange: PriceRange
  region: string
  cepage: string
}
