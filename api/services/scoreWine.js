'use strict'

const CEPAGE_BASE = {
  'pinot noir':         { tannins: 4,  acidite: 8,  corps: 4  },
  'gamay':              { tannins: 2,  acidite: 6,  corps: 4  },
  'cabernet sauvignon': { tannins: 10, acidite: 6,  corps: 10 },
  'syrah':              { tannins: 8,  acidite: 6,  corps: 8  },
  'merlot':             { tannins: 6,  acidite: 4,  corps: 6  },
  'grenache':           { tannins: 4,  acidite: 4,  corps: 6  },
  'chardonnay':         { tannins: 0,  acidite: 6,  corps: 6  },
  'riesling':           { tannins: 0,  acidite: 10, corps: 2  },
  'sauvignon blanc':    { tannins: 0,  acidite: 8,  corps: 4  },
  'chenin blanc':       { tannins: 0,  acidite: 8,  corps: 4  },
  'gewurztraminer':     { tannins: 0,  acidite: 4,  corps: 6  },
  'aligote':            { tannins: 0,  acidite: 8,  corps: 4  },
  'muscadet':           { tannins: 0,  acidite: 8,  corps: 2  },
  'viognier':           { tannins: 0,  acidite: 4,  corps: 6  },
  'roussanne':          { tannins: 0,  acidite: 4,  corps: 6  },
  'carignan':           { tannins: 6,  acidite: 8,  corps: 6  },
  'mourvedre':          { tannins: 8,  acidite: 6,  corps: 8  },
  'cinsault':           { tannins: 4,  acidite: 6,  corps: 4  },
  'malbec':             { tannins: 8,  acidite: 6,  corps: 8  },
  'cabernet franc':     { tannins: 6,  acidite: 8,  corps: 6  },
}

function stripAccents(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function findCepage(name) {
  const n = stripAccents(name.toLowerCase().trim())
  for (const [key, val] of Object.entries(CEPAGE_BASE)) {
    const k = stripAccents(key)
    if (k === n || n.includes(k) || k.includes(n)) return val
  }
  return null
}

function parseCepages(str) {
  if (!str) return []
  return str.split(/[,;]+/).map(s => s.trim().replace(/\.$/, '')).filter(Boolean).map(part => {
    let m = part.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*%\s*$/)
    if (m) return { name: m[1].trim(), pct: parseFloat(m[2]) }
    m = part.match(/^(\d+(?:\.\d+)?)\s*%\s*(?:de\s+)?(.+)$/)
    if (m) return { name: m[2].trim(), pct: parseFloat(m[1]) }
    return { name: part, pct: null }
  })
}

function scoreWine(vin) {
  const cat = vin.categorie || ''
  const parsed = parseCepages(vin.cepages)
  const matched = parsed.map(p => ({ ...p, base: findCepage(p.name) })).filter(p => p.base)

  let tannins = 0, acidite = 0, corps = 0
  if (matched.length > 0) {
    const hasPct = matched.length === parsed.length && matched.every(p => p.pct !== null)
    if (hasPct) {
      const totalPct = matched.reduce((s, p) => s + p.pct, 0)
      tannins = matched.reduce((s, p) => s + p.base.tannins * p.pct / totalPct, 0)
      acidite = matched.reduce((s, p) => s + p.base.acidite * p.pct / totalPct, 0)
      corps   = matched.reduce((s, p) => s + p.base.corps   * p.pct / totalPct, 0)
    } else {
      tannins = matched.reduce((s, p) => s + p.base.tannins, 0) / matched.length
      acidite = matched.reduce((s, p) => s + p.base.acidite, 0) / matched.length
      corps   = matched.reduce((s, p) => s + p.base.corps,   0) / matched.length
    }
  }

  let sucrosite = 0
  let bulles = cat === 'Bulles' ? 6 : 0
  let nature = 4

  const text = [vin.resume, vin.explication_plancher, vin.vinif].filter(Boolean).join(' ').toLowerCase()

  if (/tannique|charpenté|structuré|ferme/.test(text))    tannins += 2
  else if (/soyeux|velouté|souple/.test(text))            tannins -= 2

  if (/vif|nerveux|tendu|tranchant|salivant/.test(text))  acidite += 2
  else if (/rond|gras|onctueux/.test(text))               acidite -= 2

  if (/doux|sucré|moelleux|liquoreux|dosé/.test(text))    sucrosite += 2
  else if (/\bsec\b|brut|extra-brut|zéro dosage/.test(text)) sucrosite -= 2

  if (/puissant|dense|concentré|charnu/.test(text))       corps += 2
  else if (/léger|aérien|délicat|fluide/.test(text))      corps -= 2

  if (/effervescent|perlant|pétillant/.test(text))        bulles += 2

  if (/natty|sans soufre|zéro zéro|non filtré|oxydatif/.test(text)) nature += 2
  else if (/classique|conventionnel|filtré/.test(text))              nature -= 2

  if (vin.profil === 'natty_zero')             nature += 4
  else if (vin.profil === 'natty_clean')       nature += 2
  else if (vin.profil === 'low_intervention')  nature += 2
  else if (vin.profil === 'classique')         nature -= 2

  if (['Bulles', 'Blancs', 'Orange', 'Rosé'].includes(cat)) tannins = 0
  if (['Blancs', 'Rouges', 'Orange', 'Rosé'].includes(cat)) bulles = 0

  const clamp = v => Math.max(0, Math.min(10, Math.round(v)))

  return {
    tannins:   clamp(tannins),
    acidite:   clamp(acidite),
    sucrosite: clamp(sucrosite),
    corps:     clamp(corps),
    bulles:    clamp(bulles),
    nature:    clamp(nature),
  }
}

module.exports = { scoreWine }
