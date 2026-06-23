import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = resolve(__dirname, '../../data/wines.json')
const dest = resolve(__dirname, '../public/wines.json')

mkdirSync(resolve(__dirname, '../public'), { recursive: true })

if (existsSync(src)) {
  copyFileSync(src, dest)
  console.log('✓ wines.json copied to public/')
} else {
  console.log('ℹ data/wines.json not found (Netlify build) — using committed public/wines.json')
}
