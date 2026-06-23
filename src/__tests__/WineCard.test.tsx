import { render, screen, fireEvent } from '@testing-library/react'
import { WineCard } from '../components/WineCard'
import type { Wine } from '../types/wine'

function makeWine(overrides: Partial<Wine> = {}): Wine {
  return {
    id: 1,
    categorie: 'Rouges',
    sous_region: 'Bourgogne',
    reference: 'Château Test',
    millesime: 2020,
    prix: 85,
    cepages: 'Pinot Noir 100%',
    profil: 'natty_clean',
    explication_plancher: 'Un vin de test',
    resume: 'Arômes de cerises mûres et de violette',
    vinif: 'Élevage en cuve béton',
    fact: 'Domaine fondé en 1920',
    image_url: null,
    image_source: null,
    actif: 1,
    scores: null,
    ...overrides,
  }
}

const scoresWithZeros = JSON.stringify({
  tannins: 6, acidite: 8, sucrosite: 0, corps: 6, bulles: 0, nature: 8,
})

// ─── Rendu de base ────────────────────────────────────────────────────────────

describe('WineCard — rendu de base', () => {
  test('affiche la référence du vin', () => {
    render(<WineCard wine={makeWine()} isExpanded={false} onToggle={() => {}} />)
    expect(screen.getByText('Château Test')).toBeInTheDocument()
  })

  test('affiche le prix', () => {
    render(<WineCard wine={makeWine({ prix: 120 })} isExpanded={false} onToggle={() => {}} />)
    expect(screen.getByText('120 $')).toBeInTheDocument()
  })

  test('affiche le millésime', () => {
    render(<WineCard wine={makeWine({ millesime: 2021 })} isExpanded={false} onToggle={() => {}} />)
    expect(screen.getByText('2021')).toBeInTheDocument()
  })

  test('affiche les cépages', () => {
    render(<WineCard wine={makeWine()} isExpanded={false} onToggle={() => {}} />)
    expect(screen.getByText('Pinot Noir 100%')).toBeInTheDocument()
  })

  test('affiche explication_plancher', () => {
    render(<WineCard wine={makeWine()} isExpanded={false} onToggle={() => {}} />)
    expect(screen.getByText('Un vin de test')).toBeInTheDocument()
  })

  test('n\'affiche pas le millésime si absent', () => {
    render(<WineCard wine={makeWine({ millesime: '' })} isExpanded={false} onToggle={() => {}} />)
    // Vérifie qu'aucun texte d'année n'est présent (approximatif)
    expect(screen.queryByText(/^\d{4}$/)).not.toBeInTheDocument()
  })
})

// ─── Interaction (toggle) ─────────────────────────────────────────────────────

describe('WineCard — toggle', () => {
  test('appelle onToggle au clic sur la carte', () => {
    const onToggle = vi.fn()
    render(<WineCard wine={makeWine()} isExpanded={false} onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('article'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})

// ─── Section expandée ─────────────────────────────────────────────────────────

describe('WineCard — section expandée', () => {
  test('ne montre pas le résumé quand réduite', () => {
    render(<WineCard wine={makeWine()} isExpanded={false} onToggle={() => {}} />)
    expect(screen.queryByText('Arômes de cerises mûres et de violette')).not.toBeInTheDocument()
  })

  test('affiche le résumé quand expandée', () => {
    render(<WineCard wine={makeWine()} isExpanded={true} onToggle={() => {}} />)
    expect(screen.getByText('Arômes de cerises mûres et de violette')).toBeInTheDocument()
  })

  test('affiche le titre "Résumé aromatique" quand expandée', () => {
    render(<WineCard wine={makeWine()} isExpanded={true} onToggle={() => {}} />)
    expect(screen.getByText('Résumé aromatique')).toBeInTheDocument()
  })

  test('accordéon Vinification présent quand expandée', () => {
    render(<WineCard wine={makeWine()} isExpanded={true} onToggle={() => {}} />)
    expect(screen.getByText('Vinification')).toBeInTheDocument()
  })
})

// ─── Jauges de scores ─────────────────────────────────────────────────────────

describe('WineCard — jauges de scores', () => {
  test('pas de jauges quand réduite même avec scores', () => {
    render(<WineCard wine={makeWine({ scores: scoresWithZeros })} isExpanded={false} onToggle={() => {}} />)
    expect(screen.queryByText('Profil sensoriel')).not.toBeInTheDocument()
  })

  test('pas de section score si scores = null', () => {
    render(<WineCard wine={makeWine({ scores: null })} isExpanded={true} onToggle={() => {}} />)
    expect(screen.queryByText('Profil sensoriel')).not.toBeInTheDocument()
  })

  test('affiche "Profil sensoriel" quand expandée avec scores', () => {
    render(<WineCard wine={makeWine({ scores: scoresWithZeros })} isExpanded={true} onToggle={() => {}} />)
    expect(screen.getByText('Profil sensoriel')).toBeInTheDocument()
  })

  test('affiche les labels des critères non nuls', () => {
    render(<WineCard wine={makeWine({ scores: scoresWithZeros })} isExpanded={true} onToggle={() => {}} />)
    expect(screen.getByText('Tanins')).toBeInTheDocument()
    expect(screen.getByText('Acidité')).toBeInTheDocument()
    expect(screen.getByText('Corps')).toBeInTheDocument()
    expect(screen.getByText('Nature')).toBeInTheDocument()
  })

  test('masque les critères avec valeur 0', () => {
    render(<WineCard wine={makeWine({ scores: scoresWithZeros })} isExpanded={true} onToggle={() => {}} />)
    expect(screen.queryByText('Bulles')).not.toBeInTheDocument()
    expect(screen.queryByText('Sucrosité')).not.toBeInTheDocument()
  })

  test('affiche exactement 4 jauges pour les 4 critères non nuls (scoresWithZeros)', () => {
    render(<WineCard wine={makeWine({ scores: scoresWithZeros })} isExpanded={true} onToggle={() => {}} />)
    // le textContent de chaque span de valeur est "X/10" (deux text nodes collés)
    const gaugeValues = screen.getAllByText(/^\d+\/10$/)
    expect(gaugeValues).toHaveLength(4) // tannins(6), acidite(8), corps(6), nature(8)
  })

  test('tous les critères visibles quand tous > 0', () => {
    const allNonZero = JSON.stringify({ tannins: 5, acidite: 5, sucrosite: 5, corps: 5, bulles: 5, nature: 5 })
    render(<WineCard wine={makeWine({ scores: allNonZero })} isExpanded={true} onToggle={() => {}} />)
    expect(screen.getByText('Tanins')).toBeInTheDocument()
    expect(screen.getByText('Acidité')).toBeInTheDocument()
    expect(screen.getByText('Sucrosité')).toBeInTheDocument()
    expect(screen.getByText('Corps')).toBeInTheDocument()
    expect(screen.getByText('Bulles')).toBeInTheDocument()
    expect(screen.getByText('Nature')).toBeInTheDocument()
    expect(screen.getAllByText(/^\d+\/10$/)).toHaveLength(6)
  })
})
