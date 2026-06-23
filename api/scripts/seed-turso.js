// Lance ce script UNE FOIS pour peupler Turso :
// TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node api/scripts/seed-turso.js

const { createClient } = require('@libsql/client')
const wines = require('../data/wines.json')

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN ?? '',
})

;(async () => {
  console.log('Connexion à Turso...')

  await db.execute(`
    CREATE TABLE IF NOT EXISTS vins (
      id INTEGER PRIMARY KEY AUTOINCREMENT, categorie TEXT NOT NULL,
      sous_region TEXT, reference TEXT NOT NULL, millesime TEXT, prix REAL,
      cepages TEXT, profil TEXT, explication_plancher TEXT, resume TEXT,
      vinif TEXT, fact TEXT, image_url TEXT, image_source TEXT,
      actif INTEGER DEFAULT 1, scores TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)

  const { rows } = await db.execute('SELECT COUNT(*) as n FROM vins')
  if (Number(rows[0].n) > 0) {
    console.log(`✓ Déjà ${rows[0].n} vins dans Turso, rien à faire.`)
    process.exit(0)
  }

  console.log(`Insertion de ${wines.length} vins...`)
  for (let i = 0; i < wines.length; i += 100) {
    const batch = wines.slice(i, i + 100).map(w => ({
      sql: `INSERT OR IGNORE INTO vins
        (id,categorie,sous_region,reference,millesime,prix,cepages,profil,
         explication_plancher,resume,vinif,fact,image_url,image_source,actif,scores)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        w.id, w.categorie ?? '', w.sous_region ?? null, w.reference ?? '',
        w.millesime != null && w.millesime !== '' ? String(parseInt(w.millesime)) : null,
        w.prix ?? 0, w.cepages ?? null, w.profil ?? null,
        w.explication_plancher ?? null, w.resume ?? null,
        w.vinif ?? null, w.fact ?? null,
        w.image_url ?? null, w.image_source ?? null,
        w.actif ?? 1, w.scores ?? null,
      ],
    }))
    await db.batch(batch, 'write')
    process.stdout.write(`\r${Math.min(i + 100, wines.length)}/${wines.length}`)
  }

  console.log(`\n✓ ${wines.length} vins insérés dans Turso !`)
  process.exit(0)
})().catch(e => { console.error(e); process.exit(1) })
