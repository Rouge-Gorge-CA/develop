const { createClient } = require('@libsql/client')

const db = createClient(
  process.env.TURSO_DATABASE_URL
    ? { url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN ?? '' }
    : { url: process.env.TEST_DB === '1' ? ':memory:' : 'file:wine.db' }
)

// Initialise les tables uniquement (rapide, sans seed)
const ready = db.execute(`
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
`).then(() => db.execute('ALTER TABLE vins ADD COLUMN scores TEXT').catch(() => {}))

module.exports = { db, ready }
