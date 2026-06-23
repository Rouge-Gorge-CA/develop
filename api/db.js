const { createClient } = require('@libsql/client')

const db = createClient(
  process.env.TURSO_DATABASE_URL
    ? { url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN ?? '' }
    : { url: process.env.TEST_DB === '1' ? ':memory:' : 'file:wine.db' }
)

const ready = (async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS vins (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      categorie            TEXT    NOT NULL,
      sous_region          TEXT,
      reference            TEXT    NOT NULL,
      millesime            TEXT,
      prix                 REAL,
      cepages              TEXT,
      profil               TEXT,
      explication_plancher TEXT,
      resume               TEXT,
      vinif                TEXT,
      fact                 TEXT,
      image_url            TEXT,
      image_source         TEXT,
      actif                INTEGER DEFAULT 1,
      scores               TEXT,
      created_at           TEXT    DEFAULT (datetime('now')),
      updated_at           TEXT    DEFAULT (datetime('now'))
    )
  `)

  try { await db.execute('ALTER TABLE vins ADD COLUMN scores TEXT') } catch (_) {}

  const { rows } = await db.execute('SELECT COUNT(*) as n FROM vins')
  if (Number(rows[0].n) === 0) await seed()
})()

async function seed() {
  let wines
  try {
    wines = require('./data/wines.json')
  } catch {
    return
  }

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
  }
  console.log(`✓ ${wines.length} vins insérés`)
}

module.exports = { db, ready }
