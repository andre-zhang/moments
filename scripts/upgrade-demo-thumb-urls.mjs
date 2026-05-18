/**
 * Upgrades src/lib/demoPlaceThumbUrls.json to higher-res Commons thumbs.
 * - Rewrites /960px- and /500px- path segments to /1920px-
 * - For direct file URLs (no thumb segment), resolves via manifest File: titles
 * Run: node scripts/upgrade-demo-thumb-urls.mjs
 */
import fs from 'fs'
import https from 'https'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const jsonPath = path.join(root, 'src', 'lib', 'demoPlaceThumbUrls.json')
const manifestPath = path.join(__dirname, 'demo-photo-sources.json')

const WIDTH = 1920
const ua = {
  'User-Agent':
    'MomentsTravel/1.0 (https://github.com/andre-zhang/moments; demo thumb upgrade)',
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
  const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=${WIDTH}&format=json`
  const j = await getJson(api)
  const p = Object.values(j.query?.pages ?? {})[0]
  if (!p || p.missing != null) return null
  const ii = p.imageinfo?.[0]
  const thumb = ii?.thumburl || ii?.url
  return thumb ? String(thumb).split('?')[0] : null
}

function bumpThumbSegment(url) {
  let u = url
  u = u.replace(/\/\d+px-/g, `/${WIDTH}px-`)
  return u
}

function needsApiResolve(url) {
  return !/\/\d+px-/.test(url)
}

const manifest = Object.fromEntries(
  JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
)
const current = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
const out = { ...current }
let bumped = 0
let resolved = 0
let failed = 0

for (const slug of Object.keys(out)) {
  let url = out[slug]
  if (!url) continue

  if (needsApiResolve(url)) {
    const title = manifest[slug]
    if (title) {
      try {
        const thumb = await thumbForTitle(title)
        if (thumb) {
          out[slug] = thumb
          resolved++
          console.log('API', slug)
        } else {
          out[slug] = bumpThumbSegment(url)
          failed++
          console.warn('MISS', slug, title)
        }
      } catch (e) {
        failed++
        console.warn('ERR', slug, e.message)
      }
      await new Promise((r) => setTimeout(r, 280))
      continue
    }
  }

  const next = bumpThumbSegment(url)
  if (next !== url) bumped++
  out[slug] = next
}

fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2), 'utf8')
console.log('done', { bumped, resolved, failed, total: Object.keys(out).length })
