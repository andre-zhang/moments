/**
 * Resolves Commons "File:…" titles to 1920px thumbs and downloads to public/sample-photos/places/{slug}.jpg
 * Run from repo root: node scripts/fetch-demo-place-photos.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const manifestPath = path.join(__dirname, 'demo-photo-sources.json')
const outDir = path.join(root, 'public', 'sample-photos', 'places')

const rows = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'user-agent': 'MomentsDemoPhotoFetcher/1.0' } }, (res) => {
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

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const clean = url.split('?')[0]
    const f = fs.createWriteStream(dest)
    https
      .get(clean, { headers: { 'user-agent': 'MomentsDemoPhotoFetcher/1.0' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const loc = res.headers.location
          if (!loc) {
            reject(new Error('redirect no location'))
            return
          }
          res.resume()
          download(loc, dest).then(resolve).catch(reject)
          return
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`))
          return
        }
        res.pipe(f)
        f.on('finish', () => {
          f.close(resolve)
        })
      })
      .on('error', reject)
  })
}

async function thumbForTitle(title) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=1920&format=json`
  const j = await fetchJson(api)
  const pages = j.query?.pages
  if (!pages) return null
  const p = Object.values(pages)[0]
  if (p.missing != null || p.invalid != null) return null
  const ii = p.imageinfo?.[0]
  return ii?.thumburl || ii?.url || null
}

fs.mkdirSync(outDir, { recursive: true })

const resolved = []
for (const [slug, title] of rows) {
  const dest = path.join(outDir, `${slug}.jpg`)
  try {
    const thumb = await thumbForTitle(title)
    if (!thumb) {
      console.error('MISS', slug, title)
      continue
    }
    await download(thumb, dest)
    resolved.push({ slug, title, bytes: fs.statSync(dest).size })
    console.log('OK', slug, fs.statSync(dest).size)
  } catch (e) {
    console.error('FAIL', slug, title, e.message)
  }
  await new Promise((r) => setTimeout(r, 350))
}

fs.writeFileSync(
  path.join(__dirname, 'demo-photo-resolved.json'),
  JSON.stringify(resolved, null, 2),
  'utf8'
)
console.log('done', resolved.length, '/', rows.length)
