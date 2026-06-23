const express = require('express')
const cors = require('cors')

const app = express()

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:4173']

app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.use('/api/vins', require('./routes/vins'))
app.use('/api/admin', require('./routes/admin'))
app.get('/api/health', (_req, res) => res.json({ ok: true }))

module.exports = app
