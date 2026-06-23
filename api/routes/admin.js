const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { db, ready } = require('../db')
const auth = require('../middleware/auth')
const { scoreWine } = require('../services/scoreWine')

const router = express.Router()

router.use(async (_req, _res, next) => { await ready; next() })

// ─── Auth ──────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { password } = req.body
  if (!password) return res.status(400).json({ error: 'Mot de passe requis' })

  const hash = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD_HASHED
  if (!hash) return res.status(500).json({ error: 'ADMIN_PASSWORD_HASH non configuré' })

  const valid = await bcrypt.compare(password, hash)
  if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' })

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' })
  res.json({ token })
})

router.use(auth)

// ─── Stats ─────────────────────────────────────────────────────────────────
router.get('/stats', async (_req, res) => {
  const [r1, r2, r3] = await Promise.all([
    db.execute("SELECT COUNT(*) as n FROM vins WHERE actif = 1"),
    db.execute("SELECT COUNT(*) as n FROM vins WHERE actif = 1 AND (image_url IS NULL OR image_url = '')"),
    db.execute("SELECT COUNT(*) as n FROM vins WHERE actif = 0"),
  ])
  res.json({ total: Number(r1.rows[0].n), noImage: Number(r2.rows[0].n), archived: Number(r3.rows[0].n) })
})

// ─── Vins (admin) ─────────────────────────────────────────────────────────
router.get('/vins', async (req, res) => {
  const { q, categorie, actif } = req.query
  let sql = 'SELECT * FROM vins WHERE 1=1'
  const args = []

  if (actif !== undefined) { sql += ' AND actif = ?'; args.push(Number(actif)) }
  if (categorie && categorie !== 'Tous') { sql += ' AND categorie = ?'; args.push(categorie) }
  if (q) {
    sql += ' AND (LOWER(reference) LIKE ? OR LOWER(cepages) LIKE ?)'
    const t = `%${q.toLowerCase()}%`
    args.push(t, t)
  }
  sql += ' ORDER BY reference ASC'

  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = 50
  const offset = (page - 1) * limit

  const { rows: countRows } = await db.execute({ sql: `SELECT COUNT(*) as n FROM (${sql})`, args })
  const total = Number(countRows[0].n)

  const { rows } = await db.execute({ sql: sql + ' LIMIT ? OFFSET ?', args: [...args, limit, offset] })
  res.json({ vins: rows, total, page, limit })
})

router.get('/vins/sans-image', async (_req, res) => {
  const { rows } = await db.execute("SELECT * FROM vins WHERE actif = 1 AND (image_url IS NULL OR image_url = '') ORDER BY reference ASC")
  res.json(rows)
})

router.get('/vins/:id', async (req, res) => {
  const { rows } = await db.execute({ sql: 'SELECT * FROM vins WHERE id = ?', args: [req.params.id] })
  if (!rows[0]) return res.status(404).json({ error: 'Vin introuvable' })
  res.json(rows[0])
})

router.post('/vins', async (req, res) => {
  const { categorie, sous_region, reference, millesime, prix, cepages, profil, explication_plancher, resume, vinif, fact } = req.body
  if (!categorie || !reference) return res.status(400).json({ error: 'categorie et reference sont obligatoires' })

  const { lastInsertRowid } = await db.execute({
    sql: `INSERT INTO vins (categorie,sous_region,reference,millesime,prix,cepages,profil,explication_plancher,resume,vinif,fact)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    args: [categorie, sous_region || null, reference, millesime || null, prix ?? null,
           cepages || null, profil || null, explication_plancher || null, resume || null, vinif || null, fact || null],
  })

  const { rows } = await db.execute({ sql: 'SELECT * FROM vins WHERE id = ?', args: [lastInsertRowid] })
  const vin = rows[0]
  const scores = scoreWine(vin)
  await db.execute({ sql: 'UPDATE vins SET scores = ? WHERE id = ?', args: [JSON.stringify(scores), vin.id] })
  res.status(201).json({ ...vin, scores: JSON.stringify(scores) })
})

router.put('/vins/:id', async (req, res) => {
  const { rows: existing } = await db.execute({ sql: 'SELECT * FROM vins WHERE id = ?', args: [req.params.id] })
  if (!existing[0]) return res.status(404).json({ error: 'Vin introuvable' })

  const fields = ['categorie','sous_region','reference','millesime','prix','cepages','profil','explication_plancher','resume','vinif','fact']
  const updates = {}
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f] || null
  }

  if (Object.keys(updates).length > 0) {
    const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ')
    await db.execute({
      sql: `UPDATE vins SET ${setClauses}, updated_at = datetime('now') WHERE id = ?`,
      args: [...Object.values(updates), req.params.id],
    })
  }

  const { rows } = await db.execute({ sql: 'SELECT * FROM vins WHERE id = ?', args: [req.params.id] })
  const updated = rows[0]
  const scoresStr = req.body.scores !== undefined ? req.body.scores : JSON.stringify(scoreWine(updated))
  await db.execute({ sql: 'UPDATE vins SET scores = ? WHERE id = ?', args: [scoresStr, req.params.id] })
  res.json({ ...updated, scores: scoresStr })
})

router.post('/vins/:id/scores', async (req, res) => {
  const { rows } = await db.execute({ sql: 'SELECT * FROM vins WHERE id = ?', args: [req.params.id] })
  if (!rows[0]) return res.status(404).json({ error: 'Vin introuvable' })
  const scores = scoreWine(rows[0])
  await db.execute({ sql: "UPDATE vins SET scores = ?, updated_at = datetime('now') WHERE id = ?", args: [JSON.stringify(scores), req.params.id] })
  res.json({ scores })
})

router.delete('/vins/:id', async (req, res) => {
  const { rows } = await db.execute({ sql: 'SELECT id FROM vins WHERE id = ?', args: [req.params.id] })
  if (!rows[0]) return res.status(404).json({ error: 'Vin introuvable' })
  await db.execute({ sql: "UPDATE vins SET actif = 0, updated_at = datetime('now') WHERE id = ?", args: [req.params.id] })
  res.json({ ok: true })
})

router.post('/vins/:id/restore', async (req, res) => {
  await db.execute({ sql: "UPDATE vins SET actif = 1, updated_at = datetime('now') WHERE id = ?", args: [req.params.id] })
  res.json({ ok: true })
})

// ─── Image (URL seulement en serverless) ──────────────────────────────────
router.post('/vins/:id/image/select', async (req, res) => {
  const { url, source } = req.body
  if (!url) return res.status(400).json({ error: 'url requis' })
  const { rows } = await db.execute({ sql: 'SELECT id FROM vins WHERE id = ?', args: [req.params.id] })
  if (!rows[0]) return res.status(404).json({ error: 'Vin introuvable' })
  await db.execute({
    sql: "UPDATE vins SET image_url = ?, image_source = ?, updated_at = datetime('now') WHERE id = ?",
    args: [url, source ?? 'url', req.params.id],
  })
  res.json({ image_url: url, image_source: source ?? 'url' })
})

router.delete('/vins/:id/image', async (req, res) => {
  await db.execute({
    sql: "UPDATE vins SET image_url = NULL, image_source = NULL, updated_at = datetime('now') WHERE id = ?",
    args: [req.params.id],
  })
  res.json({ ok: true })
})

// ─── Import Excel ──────────────────────────────────────────────────────────
router.post('/import-excel', express.raw({ type: '*/*', limit: '10mb' }), async (req, res) => {
  if (!req.body?.length) return res.status(400).json({ error: 'Aucun fichier reçu' })

  try {
    const XLSX = require('xlsx')
    const workbook = XLSX.read(req.body, { type: 'buffer' })
    const CATEGORY_MAP = { Bulles:'Bulles', Blancs:'Blancs', Orange:'Orange', Rosé:'Rosé', Rouges:'Rouges', 'Grand Formats':'Grand Formats', 'Hors Carte':'Hors Carte' }
    const results = { added: 0, updated: 0, archived: 0, errors: [] }
    const seenIds = new Set()

    for (const sheetName of workbook.SheetNames) {
      const categorie = CATEGORY_MAP[sheetName]
      if (!categorie) continue
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' })

      for (const row of rows) {
        const reference = String(row['reference'] || row['Référence'] || row['Vin'] || '').trim()
        if (!reference) continue

        const millesime = row['millesime'] || row['Millésime'] || ''
        const millesimeStr = millesime ? String(parseInt(millesime)) : null
        const data = {
          categorie,
          sous_region: String(row['sous_region'] || row['Région'] || '').trim() || null,
          reference, millesime: millesimeStr,
          prix: parseFloat(row['prix'] || row['Prix'] || 0) || null,
          cepages: String(row['cepages'] || row['Cépages'] || '').trim() || null,
          profil: String(row['profil'] || '').trim() || null,
          explication_plancher: String(row['explication_plancher'] || '').trim() || null,
          resume: String(row['resume'] || '').trim() || null,
          vinif: String(row['vinif'] || '').trim() || null,
          fact: String(row['fact'] || '').trim() || null,
        }

        const { rows: existing } = await db.execute({
          sql: 'SELECT id FROM vins WHERE LOWER(reference) = LOWER(?) AND (millesime = ? OR (millesime IS NULL AND ? IS NULL))',
          args: [reference, millesimeStr, millesimeStr],
        })

        if (existing[0]) {
          seenIds.add(Number(existing[0].id))
          await db.execute({
            sql: `UPDATE vins SET categorie=?,sous_region=?,prix=?,cepages=?,profil=?,explication_plancher=?,resume=?,vinif=?,fact=?,actif=1,updated_at=datetime('now') WHERE id=?`,
            args: [data.categorie, data.sous_region, data.prix, data.cepages, data.profil, data.explication_plancher, data.resume, data.vinif, data.fact, existing[0].id],
          })
          results.updated++
        } else {
          const { lastInsertRowid } = await db.execute({
            sql: `INSERT INTO vins (categorie,sous_region,reference,millesime,prix,cepages,profil,explication_plancher,resume,vinif,fact) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            args: [data.categorie, data.sous_region, data.reference, data.millesime, data.prix, data.cepages, data.profil, data.explication_plancher, data.resume, data.vinif, data.fact],
          })
          seenIds.add(Number(lastInsertRowid))
          results.added++
        }
      }
    }

    const { rows: activeRows } = await db.execute('SELECT id FROM vins WHERE actif = 1')
    for (const { id } of activeRows) {
      if (!seenIds.has(Number(id))) {
        await db.execute({ sql: "UPDATE vins SET actif = 0, updated_at = datetime('now') WHERE id = ?", args: [id] })
        results.archived++
      }
    }

    res.json(results)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
