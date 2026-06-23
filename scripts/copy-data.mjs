import { copyFileSync, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
mkdirSync(resolve(__dirname, '../public'), { recursive: true })
copyFileSync(
  resolve(__dirname, '../../data/wines.json'),
  resolve(__dirname, '../public/wines.json')
)
console.log('✓ wines.json copied to public/')
