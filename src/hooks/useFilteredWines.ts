import { useMemo } from 'react'
import type { Wine, Filters, SortOption, PriceRange } from '../types/wine'
import { normalize } from '../utils/normalize'

function matchesPrice(prix: number, range: PriceRange): boolean {
  switch (range) {
    case 'lt70': return prix < 70
    case '70-100': return prix >= 70 && prix <= 100
    case '100-150': return prix > 100 && prix <= 150
    case '150-250': return prix > 150 && prix <= 250
    case 'gt250': return prix > 250
    default: return true
  }
}

export function useFilteredWines(
  wines: Wine[],
  query: string,
  filters: Filters,
  sortBy: SortOption,
) {
  const availableRegions = useMemo(() => {
    const source = filters.categorie === 'Tous'
      ? wines
      : wines.filter(w => w.categorie === filters.categorie)
    const regions = [...new Set(source.map(w => w.sous_region).filter((r): r is string => r !== null && r !== ''))]
    return ['Toutes', ...regions.sort((a, b) => a.localeCompare(b, 'fr'))]
  }, [wines, filters.categorie])

  const filtered = useMemo(() => {
    let results = wines

    if (filters.categorie !== 'Tous') {
      results = results.filter(w => w.categorie === filters.categorie)
    }

    if (filters.profils.length > 0) {
      results = results.filter(w => w.profil !== null && filters.profils.includes(w.profil))
    }

    if (filters.priceRange !== 'all') {
      results = results.filter(w => matchesPrice(w.prix, filters.priceRange))
    }

    if (filters.region !== 'Toutes') {
      results = results.filter(w => w.sous_region === filters.region)
    }

    if (filters.cepage.trim()) {
      const norm = normalize(filters.cepage)
      results = results.filter(w => normalize(w.cepages ?? '').includes(norm))
    }

    if (query.trim()) {
      const norm = normalize(query)
      results = results.filter(
        w =>
          normalize(w.reference ?? '').includes(norm) ||
          normalize(w.cepages ?? '').includes(norm) ||
          normalize(w.explication_plancher ?? '').includes(norm) ||
          normalize(w.resume ?? '').includes(norm),
      )
    }

    const sorted = [...results]
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'prix_asc': return a.prix - b.prix
        case 'prix_desc': return b.prix - a.prix
        case 'categorie':
          return a.categorie.localeCompare(b.categorie, 'fr') || a.reference.localeCompare(b.reference, 'fr')
        default:
          return a.reference.localeCompare(b.reference, 'fr')
      }
    })

    return sorted
  }, [wines, query, filters, sortBy])

  const hasActiveFilters =
    filters.categorie !== 'Tous' ||
    filters.profils.length > 0 ||
    filters.priceRange !== 'all' ||
    filters.region !== 'Toutes' ||
    filters.cepage.trim() !== '' ||
    query.trim() !== ''

  return { filtered, availableRegions, hasActiveFilters }
}
