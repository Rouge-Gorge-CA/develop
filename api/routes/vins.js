const express = require('express')
const { db, ready } = require('../db')
const router = express.Router()

router.use(async (_req, _res, next) => { await ready; next() })

router.get('/', async (req, res) => {
  const { categorie, profil, region, cepage, q, sort } = req.query

  let sql = 'SELECT * FROM vins WHERE actif = 1'
  const args = []

  if (categorie && categorie !== 'Tous') { sql += ' AND categorie = ?'; args.push(categorie) }
  if (profil) {
    const profils = profil.split(',').map(p => p.trim()).filter(Boolean)
    if (profils.length) {
      sql += ` AND profil IN (${profils.map(() => '?').join(',')})`
      args.push(...profils)
    }
  }
  if (region && region !== 'Toutes') { sql += ' AND sous_region = ?'; args.push(region) }
  if (cepage) { sql += ' AND LOWER(cepages) LIKE ?'; args.push(`%${cepage.toLowerCase()}%`) }
  if (q) {
    sql += ' AND (LOWER(reference) LIKE ? OR LOWER(cepages) LIKE ? OR LOWER(explication_plancher) LIKE ? OR LOWER(resume) LIKE ?)'
    const term = `%${q.toLowerCase()}%`
    args.push(term, term, term, term)
  }

  const sortMap = { prix_asc: 'prix ASC', prix_desc: 'prix DESC', categorie: 'categorie ASC, reference ASC', alpha: 'reference ASC' }
  sql += ` ORDER BY ${sortMap[sort] ?? 'reference ASC'}`

  const { rows } = await db.execute({ sql, args })
  res.json(rows)
})

router.get('/categories', async (_req, res) => {
  const { rows } = await db.execute("SELECT categorie, COUNT(*) as count FROM vins WHERE actif = 1 GROUP BY categorie")
  res.json(rows)
})

router.get('/regions', async (req, res) => {
  const { categorie } = req.query
  let sql = "SELECT DISTINCT sous_region FROM vins WHERE actif = 1 AND sous_region IS NOT NULL AND sous_region != ''"
  const args = []
  if (categorie && categorie !== 'Tous') { sql += ' AND categorie = ?'; args.push(categorie) }
  sql += ' ORDER BY sous_region ASC'
  const { rows } = await db.execute({ sql, args })
  res.json(rows.map(r => r.sous_region))
})

router.get('/:id', async (req, res) => {
  const { rows } = await db.execute({ sql: 'SELECT * FROM vins WHERE id = ? AND actif = 1', args: [req.params.id] })
  if (!rows[0]) return res.status(404).json({ error: 'Vin introuvable' })
  res.json(rows[0])
})

module.exports = router
