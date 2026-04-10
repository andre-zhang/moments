import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth, type VercelRequestLike } from './lib/momentsDb'

const ANTHROPIC_VERSION = '2023-06-01'

const TONE_SYSTEM = `You help someone write short personal travel notes. The text must read like a real human wrote it — plain, specific, slightly imperfect is fine. Never sound like generic AI, marketing copy, or a travel blog template.

Hard bans — do not use these words or patterns anywhere: delve, tapestry, nestled, hidden gem, vibrant, culinary journey, unlock, embrace, rich heritage, bucket list, foodie, breathtaking, picturesque, "whether you're", "it's worth noting", rhetorical questions to the reader, em dash spam, "Enjoy your trip!", "Bon voyage", "In conclusion".

Do not use filler openers ("Certainly!", "Here is…", "I'd be happy to"). Do not mention being an AI.

Only use facts and details the user actually gave you. If something is unknown, stay general in a natural way instead of inventing names, prices, or dishes you were not told about.`

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

    return res.status(400).json({ error: 'Unknown action' })
  } catch (e) {
    console.error(e)
    const msg = e instanceof Error ? e.message : 'AI request failed'
    return res.status(500).json({ error: msg })
  }
}
