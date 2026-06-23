import { renderHook } from '@testing-library/react'
import { useFilteredWines } from '../hooks/useFilteredWines'
import type { Wine, Filters } from '../types/wine'

const defaultFilters: Filters = {
  categorie: 'Tous',
  profils: [],
  priceRange: 'all',
  region: 'Toutes',
  cepage: '',
}

function makeWine(overrides: Partial<Wine> = {}): Wine {
  return {
    id: 1,
    categorie: 'Rouges',
    sous_region: 'Bourgogne',
    reference: 'Test Wine',
    millesime: 2020,
    prix: 85,
    cepages: 'Pinot Noir',
    profil: null,
    explication_plancher: 'Vin élégant',
    resume: 'Arômes de fruits',
    vinif: '',
    fact: '',
    image_url: null,
    image_source: null,
    actif: 1,
    scores: null,
    ...overrides,
  }
}

const WINES: Wine[] = [
  makeWine({ id: 1, categorie: 'Rouges',  reference: 'Pinot de Bourgogne',  prix: 90,  sous_region: 'Bourgogne', profil: 'natty_clean',     cepages: 'Pinot Noir' }),
  makeWine({ id: 2, categorie: 'Blancs',  reference: 'Muscadet Loire',       prix: 55,  sous_region: 'Loire',      profil: 'classique',       cepages: 'Muscadet' }),
  makeWine({ id: 3, categorie: 'Bulles',  reference: 'Champagne Nature',     prix: 120, sous_region: 'Champagne', profil: 'low_intervention', cepages: 'Chardonnay' }),
  makeWine({ id: 4, categorie: 'Rouges',  reference: 'Bordeaux Classique',   prix: 200, sous_region: 'Bordeaux',  profil: 'classique',       cepages: 'Cabernet Sauvignon' }),
  makeWine({ id: 5, categorie: 'Orange',  reference: 'Côtes du Rhône',       prix: 70,  sous_region: 'Rhône',     profil: null,              cepages: 'Grenache', explication_plancher: 'Vin oxydatif et tanné' }),
]

function run(query = '', filters: Filters = defaultFilters, sort: Parameters<typeof useFilteredWines>[3] = 'alpha') {
  return renderHook(() => useFilteredWines(WINES, query, filters, sort)).result.current
}

// ─── Filtres ──────────────────────────────────────────────────────────────────

describe('Filtres', () => {
  test('aucun filtre → tous les vins', () => {
    expect(run().filtered).toHaveLength(5)
  })

  test('filtre par catégorie', () => {
    const { filtered } = run('', { ...defaultFilters, categorie: 'Rouges' })
    expect(filtered).toHaveLength(2)
    expect(filtered.every(w => w.categorie === 'Rouges')).toBe(true)
  })

  test('filtre par un profil', () => {
    const { filtered } = run('', { ...defaultFilters, profils: ['classique'] })
    expect(filtered).toHaveLength(2)
    expect(filtered.every(w => w.profil === 'classique')).toBe(true)
  })

  test('filtre par plusieurs profils (union)', () => {
    const { filtered } = run('', { ...defaultFilters, profils: ['natty_clean', 'low_intervention'] })
    expect(filtered).toHaveLength(2)
  })

  test('filtre prix lt70 (<70$)', () => {
    const { filtered } = run('', { ...defaultFilters, priceRange: 'lt70' })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].prix).toBe(55)
  })

  test('filtre prix 70-100', () => {
    const { filtered } = run('', { ...defaultFilters, priceRange: '70-100' })
    expect(filtered.every(w => w.prix >= 70 && w.prix <= 100)).toBe(true)
    expect(filtered).toHaveLength(2) // 70 et 90
  })

  test('filtre prix 100-150', () => {
    const { filtered } = run('', { ...defaultFilters, priceRange: '100-150' })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].prix).toBe(120)
  })

  test('filtre prix gt250 → aucun résultat', () => {
    expect(run('', { ...defaultFilters, priceRange: 'gt250' }).filtered).toHaveLength(0)
  })

  test('filtre par région', () => {
    const { filtered } = run('', { ...defaultFilters, region: 'Loire' })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].sous_region).toBe('Loire')
  })

  test('filtre par cépage (recherche partielle)', () => {
    const { filtered } = run('', { ...defaultFilters, cepage: 'pinot' })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe(1)
  })

  test('filtre cépage insensible à la casse et aux accents', () => {
    const { filtered } = run('', { ...defaultFilters, cepage: 'grenache' })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe(5)
  })
})

// ─── Recherche texte ──────────────────────────────────────────────────────────

describe('Recherche texte', () => {
  test('recherche sur reference', () => {
    const { filtered } = run('champagne')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].reference).toBe('Champagne Nature')
  })

  test('insensible à la casse', () => {
    const { filtered } = run('PINOT')
    expect(filtered.some(w => w.reference === 'Pinot de Bourgogne')).toBe(true)
  })

  test('insensible aux accents : "cotes" trouve "Côtes"', () => {
    const { filtered } = run('cotes')
    expect(filtered.some(w => w.reference === 'Côtes du Rhône')).toBe(true)
  })

  test('recherche sur explication_plancher', () => {
    const { filtered } = run('oxydatif') // dans le vin id:5
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe(5)
  })

  test('query vide → tous les vins', () => {
    expect(run('  ').filtered).toHaveLength(5)
  })
})

// ─── Tri ──────────────────────────────────────────────────────────────────────

describe('Tri', () => {
  test('alpha : ordre alphabétique (reference)', () => {
    const { filtered } = run('', defaultFilters, 'alpha')
    const refs = filtered.map(w => w.reference)
    expect(refs).toEqual([...refs].sort((a, b) => a.localeCompare(b, 'fr')))
  })

  test('prix_asc : du moins cher au plus cher', () => {
    const { filtered } = run('', defaultFilters, 'prix_asc')
    const prices = filtered.map(w => w.prix)
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1])
    }
  })

  test('prix_desc : du plus cher au moins cher', () => {
    const { filtered } = run('', defaultFilters, 'prix_desc')
    const prices = filtered.map(w => w.prix)
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i - 1])
    }
  })

  test('categorie : trié par catégorie puis référence', () => {
    const { filtered } = run('', defaultFilters, 'categorie')
    for (let i = 1; i < filtered.length; i++) {
      const cmp = filtered[i].categorie.localeCompare(filtered[i - 1].categorie, 'fr')
      expect(cmp).toBeGreaterThanOrEqual(0)
    }
  })
})

// ─── hasActiveFilters & availableRegions ──────────────────────────────────────

describe('hasActiveFilters', () => {
  test('false avec les filtres par défaut', () => {
    expect(run().hasActiveFilters).toBe(false)
  })

  test('true si catégorie filtrée', () => {
    expect(run('', { ...defaultFilters, categorie: 'Rouges' }).hasActiveFilters).toBe(true)
  })

  test('true si query présente', () => {
    expect(run('test').hasActiveFilters).toBe(true)
  })

  test('true si priceRange actif', () => {
    expect(run('', { ...defaultFilters, priceRange: 'lt70' }).hasActiveFilters).toBe(true)
  })

  test('true si profil sélectionné', () => {
    expect(run('', { ...defaultFilters, profils: ['classique'] }).hasActiveFilters).toBe(true)
  })
})

describe('availableRegions', () => {
  test('contient toujours "Toutes" en premier', () => {
    expect(run().availableRegions[0]).toBe('Toutes')
  })

  test('filtre les régions selon la catégorie active', () => {
    const { availableRegions } = run('', { ...defaultFilters, categorie: 'Rouges' })
    expect(availableRegions).toContain('Bourgogne')
    expect(availableRegions).toContain('Bordeaux')
    expect(availableRegions).not.toContain('Loire')     // Blancs
    expect(availableRegions).not.toContain('Champagne') // Bulles
  })

  test('toutes les régions si catégorie = Tous', () => {
    const { availableRegions } = run()
    expect(availableRegions).toContain('Bourgogne')
    expect(availableRegions).toContain('Loire')
    expect(availableRegions).toContain('Champagne')
  })
})
