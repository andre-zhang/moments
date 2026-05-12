/**
 * Builds src/lib/demoPlaceThumbUrls.json — unique Commons thumb per slug (place-themed search).
 * Run: node scripts/build-demo-place-thumb-urls.mjs
 */
import fs from 'fs'
import https from 'https'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outPath = path.join(root, 'src', 'lib', 'demoPlaceThumbUrls.json')

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

async function searchFileTitles(q, limit = 8) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=${limit}&prop=info&format=json`
  const j = await getJson(url)
  const pages = j.query?.pages
  if (!pages) return []
  return Object.values(pages)
    .map((p) => p.title)
    .filter((t) => typeof t === 'string' && t.startsWith('File:'))
}

async function thumbForTitle(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=960&format=json`
  const j = await getJson(url)
  const p = Object.values(j.query?.pages ?? {})[0]
  if (!p?.imageinfo?.[0]?.thumburl) return null
  return String(p.imageinfo[0].thumburl).split('?')[0]
}

const slugQueries = [
  ['m-pch-sf-0', 'San Francisco Golden Gate Bridge'],
  ['m-pch-sf-1', 'Mission District San Francisco'],
  ['m-pch-sf-2', 'Castro Street San Francisco'],
  ['m-pch-bixby-0', 'Bixby Creek Bridge California'],
  ['m-pch-bixby-1', 'Big Sur California coast'],
  ['m-pch-bixby-2', 'Pacific Coast Highway California ocean'],
  ['m-ptl-porto-0', 'Porto Portugal Douro river'],
  ['m-ptl-porto-1', 'Dom Luís bridge Porto'],
  ['m-ptl-porto-2', 'Ribeira Porto Portugal houses'],
  ['m-hok-niseko-0', 'Niseko ski Japan'],
  ['m-hok-niseko-1', 'Mount Yotei Hokkaido'],
  ['m-hok-niseko-2', 'Hokkaido snow landscape'],
  ['m-nyc-met-0', 'Metropolitan Museum of Art New York facade'],
  ['m-nyc-met-1', 'Met Museum New York Greek gallery'],
  ['m-nyc-met-2', 'Metropolitan Museum steps New York'],
  ['m-spring-bistro-0', 'Paris bistro restaurant Seine'],
  ['m-spring-bistro-1', 'French dinner wine Paris'],
  ['m-spring-bistro-2', 'Paris cafe terrace evening'],
  ['m-ptl-tram-0', 'Lisbon tram 28'],
  ['m-ptl-tram-1', 'Alfama Lisbon Portugal'],
  ['m-ptl-tram-2', 'Lisbon miradouro'],
  ['m-ptl-pasteis-0', 'Pastéis de Belém'],
  ['m-ptl-pasteis-1', 'Belém Tower Lisbon'],
  ['m-ptl-pasteis-2', 'Jerónimos Monastery Lisbon'],
  ['m-pch-la-0', 'Los Angeles skyline'],
  ['m-pch-la-1', 'Venice Beach Los Angeles'],
  ['m-pch-la-2', 'East Los Angeles street art'],
  ['m-spring-louvre-0', 'Louvre pyramid Paris'],
  ['m-spring-louvre-1', 'Louvre museum Paris interior'],
  ['m-spring-hotel-0', 'Paris Haussmann building'],
  ['m-spring-hotel-1', 'Eiffel Tower Champ de Mars'],
  ['m-spring-montmartre-0', 'Sacré-Cœur Montmartre'],
  ['m-spring-montmartre-1', 'Place du Tertre Paris'],
  ['m-spring-montmartre-2', 'Montmartre Paris stairs'],
  ['m-spring-shinjuku-hotel-0', 'Shinjuku Tokyo skyline night'],
  ['m-spring-shinjuku-hotel-1', 'Tokyo skyscrapers Shinjuku'],
  ['m-spring-yoyogi-0', 'Shibuya Yoyogi Park seen from Shibuya Stream'],
  ['m-spring-yoyogi-1', 'Yoyogi National Gymnasium Tokyo 2020'],
  ['m-ptl-cascais-0', 'Cascais Portugal beach'],
  ['m-ptl-cascais-1', 'Cascais marina Portugal'],
  ['m-ptl-fado-0', 'Lisbon night Alfama'],
  ['m-ptl-fado-1', 'Portuguese guitar fado'],
  ['m-hok-sapporo-0', 'Sapporo snow festival'],
  ['m-hok-sapporo-1', 'Odori Park Sapporo winter'],
  ['m-hok-otaru-0', 'Otaru canal Hokkaido'],
  ['m-hok-otaru-1', 'Otaru Japan warehouse'],
  ['m-hok-onsen-hotel-0', 'Japanese onsen outdoor'],
  ['m-hok-onsen-hotel-1', 'Ryokan Japan winter'],
  ['m-nyc-bagel-0', 'Prospect Park Brooklyn'],
  ['m-nyc-bagel-1', 'Brooklyn brownstones New York'],
  ['m-nyc-hotel-0', 'Manhattan skyline dusk'],
  ['m-nyc-hotel-1', 'Times Square New York'],
  ['m-nyc-high-line-0', 'High Line park New York'],
  ['m-nyc-high-line-1', 'Chelsea New York High Line'],
  ['m-nyc-jazz-0', 'Greenwich Village New York'],
  ['m-nyc-jazz-1', 'Jazz club New York City'],
  ['m-pch-carmel-0', 'Carmel California beach'],
  ['m-pch-carmel-1', 'Point Lobos California'],
  ['m-pch-santa-barbara-0', 'Santa Barbara pier California'],
  ['m-pch-santa-barbara-1', 'Stearns Wharf Santa Barbara'],
  ['m-pch-morro-0', 'Morro Rock California'],
  ['m-pch-morro-1', 'Morro Bay California harbor'],
  ['m-uk-iad-lhr-0', 'London Heathrow airport terminal'],
  ['m-uk-iad-lhr-1', 'British Airways Heathrow aircraft'],
  ['m-uk-chips-pub-0', 'English pub interior London'],
  ['m-uk-chips-pub-1', 'Fish and chips England'],
  ['m-uk-british-museum-0', 'British Museum Great Court'],
  ['m-uk-british-museum-1', 'British Museum London gallery'],
  ['m-uk-hotel-london-0', 'Marylebone London street'],
  ['m-uk-hotel-london-1', "Regent's Park London"],
  ['m-uk-notes-kings-cross-0', "King's Cross station London"],
  ['m-uk-notes-kings-cross-1', 'St Pancras London station'],
  ['m-uk-edinburgh-castle-0', 'Edinburgh Castle Scotland'],
  ['m-uk-edinburgh-castle-1', 'Edinburgh Castle rock'],
  ['m-uk-edinburgh-castle-2', 'Edinburgh Old Town skyline'],
  ['m-uk-whisky-bar-0', 'Scotch whisky tasting'],
  ['m-uk-whisky-bar-1', 'Grassmarket Edinburgh pub'],
  ['m-uk-calton-hill-0', 'Calton Hill Edinburgh sunset'],
  ['m-uk-calton-hill-1', 'Nelson Monument Edinburgh'],
  ['m-uk-calton-hill-2', 'Edinburgh skyline Arthur Seat'],
  ['m-spring-cdg-0', 'Charles de Gaulle airport Paris'],
  ['m-spring-cdg-1', 'Air France aircraft Paris CDG'],
  ['m-spring-cdg-2', 'Paris airport runway'],
  ['m-spring-tokyo-flight-0', 'Haneda airport Tokyo'],
  ['m-spring-tokyo-flight-1', 'Japan Airlines Haneda'],
  ['m-spring-tokyo-flight-2', 'Mount Fuji from airplane'],
  ['m-spring-ramen-0', 'Shibuya crossing Tokyo night'],
  ['m-spring-ramen-1', 'Ramen bowl Japan'],
  ['m-spring-ramen-2', 'Tokyo izakaya interior'],
  ['m-echo-2024-0330-0', 'Lisbon Portugal rainy'],
  ['m-echo-2024-0330-1', 'Lisbon waterfront Tagus'],
  ['m-echo-2025-0330-0', 'Central Park New York'],
  ['m-echo-2025-0330-1', 'Manhattan coffee shop'],
  ['m-echo-2026-0330-0', 'Ueno Park cherry blossoms'],
  ['m-echo-2026-0330-1', 'Tokyo Skytree'],
  ['m-echo-2026-0330-2', 'Chidorigafuchi cherry blossoms Tokyo'],
]

const usedTitles = new Set()
const out = {}

for (const [slug, q] of slugQueries) {
  const titles = await searchFileTitles(q, 10)
  let thumb = null
  for (const t of titles) {
    if (usedTitles.has(t)) continue
    thumb = await thumbForTitle(t)
    if (thumb) {
      usedTitles.add(t)
      break
    }
    await new Promise((r) => setTimeout(r, 150))
  }
  if (!thumb) {
    console.error('NO_THUMB', slug, q)
    process.exitCode = 1
    continue
  }
  out[slug] = thumb
  console.log(slug)
  await new Promise((r) => setTimeout(r, 250))
}

fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8')
console.log('wrote', outPath, Object.keys(out).length)
