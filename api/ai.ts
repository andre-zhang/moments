import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, type VercelRequestLike } from './lib/momentsDb'

const ANTHROPIC_VERSION = '2023-06-01'

const TONE_SYSTEM = `You help someone write short personal travel notes. The text must read like a real human wrote it: plain, specific, slightly imperfect is fine. Never sound like generic AI, marketing copy, or a travel blog template.

Hard bans (do not use anywhere in your writing): delve, tapestry, nestled, hidden gem, vibrant, culinary journey, unlock, embrace, rich heritage, bucket list, foodie, breathtaking, picturesque, "whether you're", "it's worth noting", rhetorical questions to the reader, "Enjoy your trip!", "Bon voyage", "In conclusion".

Do not use the em dash character (Unicode 2014). Do not use three matching parallel phrases in a row (no "the X, the Y, and the Z" rhythm). Uneven, short clauses are better than slogan symmetry.

Do not use filler openers ("Certainly!", "Here is…", "I'd be happy to"). Do not mention being an AI.

Only use facts and details the user actually gave you. If something is unknown, stay general in a natural way instead of inventing names, prices, or dishes you were not told about.`

const JSON_OUTPUT_RULES = `Reply with a single JSON object only. No markdown code fences. No text before or after the JSON.`

/** Pull first balanced `{...}` object; respects double-quoted strings so `{` in copy does not break. */
function sliceFirstJsonObject(text: string): string {
  const s = text.indexOf('{')
  if (s < 0) throw new Error('No JSON object in model output')
  let i = s
  let depth = 0
  let inString = false
  let escape = false
  while (i < text.length) {
    const c = text[i]!
    if (inString) {
      if (escape) escape = false
      else if (c === '\\') escape = true
      else if (c === '"') inString = false
      i++
      continue
    }
    if (c === '"') {
      inString = true
      i++
      continue
    }
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return text.slice(s, i + 1)
    }
    i++
  }
  throw new Error('Unclosed JSON object in model output')
}

function extractJsonObject(text: string): unknown {
  let t = text.replace(/^\uFEFF/, '').trim()
  const fence = /```(?:json)?\s*([\s\S]*?)```/i
  const m = t.match(fence)
  if (m?.[1]) t = m[1].trim()
  try {
    return JSON.parse(t) as unknown
  } catch {
    return JSON.parse(sliceFirstJsonObject(t)) as unknown
  }
}

async function callClaude(
  system: string,
  user: string,
  maxTokens: number
): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key?.trim()) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }
  const model =
    process.env.ANTHROPIC_MODEL?.trim() || 'claude-3-5-haiku-20241022'

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })

  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Anthropic error ${res.status}: ${t.slice(0, 500)}`)
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>
  }
  const block = data.content?.[0]
  const text = block?.type === 'text' ? block.text : undefined
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Unexpected response from model')
  }
  return text.trim()
}

type MomentLine = {
  visitedAt: string
  kind: string
  title: string
  destinationName: string
  placeLabel?: string
  bodySnippet?: string
  tags?: string[]
}

function buildTripRecapUserPrompt(
  tripName: string,
  moments: MomentLine[]
): string {
  const lines = moments
    .map((m) => {
      const bits = [
        m.visitedAt,
        m.kind,
        `"${m.title}"`,
        `@ ${m.destinationName}`,
      ]
      if (m.placeLabel) bits.push(`place: ${m.placeLabel}`)
      if (m.bodySnippet) bits.push(`note: ${m.bodySnippet}`)
      if (m.tags?.length) bits.push(`tags: ${m.tags.join(', ')}`)
      return `- ${bits.join(' · ')}`
    })
    .join('\n')

  return `Trip name: ${tripName}

Moments on this trip (most recent first):
${lines || '(none listed)'}

Write ONE short paragraph, 3–6 sentences, as a personal memory of the trip. Sound like someone's journal, not a brochure. No bullet points in your answer. No title line. Plain text only.`
}

function buildPlaceTipsUserPrompt(payload: {
  kind: 'restaurant' | 'sight'
  title: string
  destinationName: string
  placeLabel?: string
  adminRegion?: string
  countryCode?: string
  bodySnippet?: string
  restaurant?: {
    cuisine?: string
    venueStyle?: string
    rating?: number
    wouldEatAgain?: boolean
  }
  sight?: {
    venueType?: string
    highlights?: string
  }
}): string {
  const area = [payload.adminRegion, payload.countryCode]
    .filter(Boolean)
    .join(', ')
  const r = payload.restaurant
  const s = payload.sight
  const extras: string[] = []
  if (r) {
    if (r.cuisine) extras.push(`cuisine (user said): ${r.cuisine}`)
    if (r.venueStyle) extras.push(`style (user said): ${r.venueStyle}`)
    if (r.rating != null) extras.push(`user rating: ${r.rating}/5`)
    if (r.wouldEatAgain === true) extras.push('user would go again')
    if (r.wouldEatAgain === false) extras.push('user would skip next time')
  }
  if (s) {
    if (s.venueType) extras.push(`type (user said): ${s.venueType}`)
    if (s.highlights?.trim()) extras.push(`user highlights: ${s.highlights.trim()}`)
  }
  if (payload.bodySnippet) extras.push(`user note: ${payload.bodySnippet}`)

  return `This is a ${payload.kind} moment.

Name (user): ${payload.title}
General place / area: ${payload.placeLabel || 'not specified'}
Destination bucket: ${payload.destinationName}
Rough location hints: ${area || 'not specified'}
${extras.length ? `Other details from the user:\n${extras.map((e) => `- ${e}`).join('\n')}` : 'No other structured details.'}

Write exactly 2 or 3 lines. Each line must start with "- " (hyphen and space). Sound like a quick text to a friend with casual ideas — not hype, not a review article. These are guesses and tips, not facts; keep wording humble (e.g. "might be worth", "if you like…"). No intro line before the bullets. No closing line after. Plain text only.`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!requireAuth(req as VercelRequestLike)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    return res.status(503).json({ error: 'AI is not configured (ANTHROPIC_API_KEY)' })
  }

  let body: unknown
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }

  const b = body as { action?: string }

  try {
    if (b.action === 'trip_recap') {
      const tripName = (b as { tripName?: string }).tripName?.trim()
      const moments = (b as { moments?: MomentLine[] }).moments
      if (!tripName || !Array.isArray(moments)) {
        return res.status(400).json({ error: 'tripName and moments[] required' })
      }
      const user = buildTripRecapUserPrompt(tripName, moments)
      const text = await callClaude(TONE_SYSTEM, user, 400)
      return res.status(200).json({ text })
    }

    if (b.action === 'place_tips') {
      const p = b as {
        kind?: string
        title?: string
        destinationName?: string
        placeLabel?: string
        adminRegion?: string
        countryCode?: string
        bodySnippet?: string
        restaurant?: Record<string, unknown>
        sight?: Record<string, unknown>
      }
      const kind = p.kind === 'restaurant' || p.kind === 'sight' ? p.kind : null
      const title = p.title?.trim()
      const destinationName = p.destinationName?.trim()
      if (!kind || !title || !destinationName) {
        return res
          .status(400)
          .json({ error: 'kind, title, destinationName required' })
      }
      const user = buildPlaceTipsUserPrompt({
        kind,
        title,
        destinationName,
        placeLabel: p.placeLabel?.trim(),
        adminRegion: p.adminRegion?.trim(),
        countryCode: p.countryCode?.trim(),
        bodySnippet: p.bodySnippet?.trim(),
        restaurant:
          kind === 'restaurant' && p.restaurant && typeof p.restaurant === 'object'
            ? (p.restaurant as {
                cuisine?: string
                venueStyle?: string
                rating?: number
                wouldEatAgain?: boolean
              })
            : undefined,
        sight:
          kind === 'sight' && p.sight && typeof p.sight === 'object'
            ? (p.sight as { venueType?: string; highlights?: string })
            : undefined,
      })
      const text = await callClaude(TONE_SYSTEM, user, 280)
      return res.status(200).json({ text })
    }

    if (b.action === 'passport_curate') {
      const p = b as {
        stamps?: Array<{ id: string; label: string; detail: string }>
        yearCards?: Record<string, Array<{ id: string; headline: string; sub?: string }>>
        contextDigest?: string
      }
      const stamps = p.stamps
      const yearCards = p.yearCards
      const digest = p.contextDigest?.trim() ?? ''
      if (!Array.isArray(stamps) || !yearCards || typeof yearCards !== 'object') {
        return res.status(400).json({ error: 'stamps[] and yearCards required' })
      }

      const stampLines = stamps
        .map((s) => `- id ${s.id} | label: ${s.label} | current detail: ${s.detail}`)
        .join('\n')
      const yearLines = Object.entries(yearCards)
        .map(([y, cards]) => {
          const lines = (cards ?? [])
            .map((c) => `    - id ${c.id} | headline: ${c.headline}${c.sub ? ` | sub: ${c.sub}` : ''}`)
            .join('\n')
          return `  Year ${y}:\n${lines || '    (no cards)'}`
        })
        .join('\n')

      const stampIds = stamps.map((s) => s.id).join(', ')
      const yearKeys = Object.keys(yearCards).join(', ')
      const user = `You are tightening passport stamp lines and year-in-review card copy. The user already has algorithmic drafts; rewrite them so they feel like a real person wrote them, using only the facts implied below.

Context from their moments (may be partial):
${digest || '(none)'}

Stamps (rewrite the detail line only; keep the same meaning, shorter or clearer):
${stampLines}

Year-in-review cards (rewrite headline and optional sub; keep the same statistical facts, same card ids):
${yearLines}

Return a JSON object with exactly two keys: "stampDetails" and "yearCards".
- stampDetails: object whose keys are every stamp id: ${stampIds}. Each value is one short line (max ~120 chars), no em dashes.
- yearCards: object whose keys are exactly these year strings: ${yearKeys}. Each value is an array of objects { "id", "headline", "sub?" } with the same ids in the same order as given for that year. Only rewrite headline and sub strings.`

      const raw = await callClaude(
        `${TONE_SYSTEM}\n\n${JSON_OUTPUT_RULES}`,
        user,
        1800
      )
      let parsed: unknown
      try {
        parsed = extractJsonObject(raw)
      } catch {
        return res.status(502).json({ error: 'Model did not return valid JSON' })
      }
      const obj = parsed as {
        stampDetails?: Record<string, unknown>
        yearCards?: Record<string, unknown>
      }
      return res.status(200).json({
        stampDetails: obj.stampDetails ?? {},
        yearCards: obj.yearCards ?? {},
      })
    }

    if (b.action === 'passport_kind_curate') {
      const p = b as {
        kind?: string
        moments?: Array<{
          id: string
          title: string
          visitedAt: string
          tripName: string
          destName: string
          placeLabel?: string
          summaryLine: string
        }>
      }
      const kind = p.kind
      const moments = p.moments
      if (
        !kind ||
        !['flight', 'hotel', 'restaurant', 'sight', 'note'].includes(kind) ||
        !Array.isArray(moments)
      ) {
        return res.status(400).json({ error: 'kind and moments[] required' })
      }

      const ids = moments.map((m) => m.id)
      const lines = moments
        .map(
          (m) =>
            `- id ${m.id} | ${m.visitedAt} | ${m.title} | ${m.destName} / ${m.tripName} | ${m.summaryLine}${m.placeLabel ? ` | place: ${m.placeLabel}` : ''}`
        )
        .join('\n')

      const user = `Passport category: ${kind}

Moments in this spread (newest listed first; ids must be preserved exactly):
${lines}

Return JSON:
{
  "momentLines": { "moment-id": "one short subtitle line for the passport list, max ~90 chars" },
  "orderedIds": [ "..." ],
  "kindBlurb": "optional single sentence under the section title, max ~120 chars, or empty string"
}

Rules:
- momentLines: include a line for every moment id above. Plain, human, no hype. No em dashes. No three-part parallel slogans.
- orderedIds: must be every id above exactly once, in the order you would show them (story first, not strict date).
- kindBlurb may be "" if nothing useful to add.`

      const raw = await callClaude(
        `${TONE_SYSTEM}\n\n${JSON_OUTPUT_RULES}`,
        user,
        1600
      )
      let parsed: unknown
      try {
        parsed = extractJsonObject(raw)
      } catch {
        return res.status(502).json({ error: 'Model did not return valid JSON' })
      }
      const obj = parsed as {
        momentLines?: Record<string, unknown>
        orderedIds?: unknown
        kindBlurb?: unknown
      }

      const idSet = new Set(ids)
      const linesOut: Record<string, string> = {}
      if (obj.momentLines && typeof obj.momentLines === 'object') {
        for (const id of ids) {
          const v = (obj.momentLines as Record<string, unknown>)[id]
          if (typeof v === 'string' && v.trim()) {
            linesOut[id] = v.trim().slice(0, 120)
          }
        }
      }

      let orderedIds: string[] | null = null
      if (Array.isArray(obj.orderedIds)) {
        const o = obj.orderedIds.filter((x): x is string => typeof x === 'string')
        if (o.length === ids.length && new Set(o).size === ids.length) {
          const ok = o.every((x) => idSet.has(x))
          if (ok) orderedIds = o
        }
      }

      const kindBlurb =
        typeof obj.kindBlurb === 'string' ? obj.kindBlurb.trim().slice(0, 160) : ''

      return res.status(200).json({
        momentLines: linesOut,
        orderedIds: orderedIds ?? ids,
        kindBlurb: kindBlurb || undefined,
      })
    }

    return res.status(400).json({ error: 'Unknown action' })
  } catch (e) {
    console.error(e)
    const msg = e instanceof Error ? e.message : 'AI request failed'
    return res.status(500).json({ error: msg })
  }
}
