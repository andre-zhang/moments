/**
 * Builds src/lib/demoPlaceThumbUrls.json from scripts/demo-photo-sources.json.
 * Prefer: node scripts/upgrade-demo-thumb-urls.mjs (keeps working URLs, bumps to 1920px).
 * Full rebuild from manifest only when titles are verified (many File: names 404).
 * Run: node scripts/build-demo-place-thumb-urls.mjs
 */
import fs from 'fs'
import https from 'https'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const manifestPath = path.join(__dirname, 'demo-photo-sources.json')
const outPath = path.join(root, 'src', 'lib', 'demoPlaceThumbUrls.json')

const DEMO_THUMB_WIDTH = 1920

const ua = {
  'User-Agent':
    'MomentsTravel/1.0 (https://github.com/andre-zhang/moments; demo photo manifest)',
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: ua }, (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () => {
          try {
            resolve(JSON.parse(d))
          } catch (e) {
            reject(e)
          }
        })
      })
      .on('error', reject)
  })
}

async function thumbForTitle(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=${DEMO_THUMB_WIDTH}&format=json`
  const j = await getJson(url)
  const p = Object.values(j.query?.pages ?? {})[0]
  if (!p || p.missing != null) return null
  const ii = p.imageinfo?.[0]
  const thumb = ii?.thumburl || ii?.url
  return thumb ? String(thumb).split('?')[0] : null
}

const rows = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const prior = fs.existsSync(outPath)
  ? JSON.parse(fs.readFileSync(outPath, 'utf8'))
  : {}
const out = { ...prior }

for (const [slug, title] of rows) {
  try {
    const thumb = await thumbForTitle(title)
    if (thumb) {
      out[slug] = thumb
      console.log('OK', slug)
    } else {
      console.warn('KEEP', slug, title)
    }
  } catch (e) {
    console.warn('ERR', slug, e.message)
  }
  await new Promise((r) => setTimeout(r, 400))
}

fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8')
console.log('wrote', outPath, Object.keys(out).length)
