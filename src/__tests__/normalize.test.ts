import { normalize, formatMillesime, formatPrix } from '../utils/normalize'

describe('normalize', () => {
  test('convertit en minuscules', () => {
    expect(normalize('CHÂTEAU')).toBe('chateau')
  })

  test('supprime les accents aigus', () => {
    expect(normalize('étoile')).toBe('etoile')
  })

  test('supprime les accents graves et circonflexes', () => {
    expect(normalize('à â ô û')).toBe('a a o u')
  })

  test('supprime tréma', () => {
    expect(normalize('Gewürztraminer')).toBe('gewurztraminer')
  })

  test('chaîne complète : Château Étoile', () => {
    expect(normalize('Château Étoile')).toBe('chateau etoile')
  })

  test('chaîne vide → chaîne vide', () => {
    expect(normalize('')).toBe('')
  })

  test('sans accents → inchangé (hors casse)', () => {
    expect(normalize('Pinot Noir')).toBe('pinot noir')
  })
})

describe('formatMillesime', () => {
  test('nombre entier', () => {
    expect(formatMillesime(2020)).toBe('2020')
  })

  test('chaîne numérique', () => {
    expect(formatMillesime('2020')).toBe('2020')
  })

  test('null → chaîne vide', () => {
    expect(formatMillesime(null)).toBe('')
  })

  test('undefined → chaîne vide', () => {
    expect(formatMillesime(undefined)).toBe('')
  })

  test('chaîne non numérique → chaîne vide', () => {
    expect(formatMillesime('abc')).toBe('')
  })

  test('0 → "0" (cas limite falsy)', () => {
    expect(formatMillesime(0)).toBe('0')
  })

  test('flottant → tronqué en entier', () => {
    expect(formatMillesime(2020.9)).toBe('2020')
  })
})

describe('formatPrix', () => {
  test('ajoute le symbole $', () => {
    expect(formatPrix(85)).toBe('85 $')
  })

  test('prix à virgule', () => {
    expect(formatPrix(85.5)).toBe('85.5 $')
  })

  test('prix zéro', () => {
    expect(formatPrix(0)).toBe('0 $')
  })
})
