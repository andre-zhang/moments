import { apiUrl, isNeonSyncEnabled, syncHeaders } from './syncEnv'

async function readJsonBody(r: Response): Promise<unknown> {
  const text = await r.text()
  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error(`Empty response (HTTP ${r.status})`)
  }
  try {
    return JSON.parse(trimmed) as unknown
  } catch {
    const preview = trimmed.slice(0, 180).replace(/\s+/g, ' ')
    throw new Error(
      `Bad response (HTTP ${r.status}). Expected JSON: ${preview}${trimmed.length > 180 ? '…' : ''}`
    )
  }
}

export async function requestPlaceTips(payload: {
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
}): Promise<string> {
  const r = await fetch(apiUrl('/api/ai'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...syncHeaders(),
    },
    body: JSON.stringify({
      action: 'place_tips',
      ...payload,
    }),
  })
  const j = (await readJsonBody(r)) as { text?: string; error?: string }
  if (!r.ok) throw new Error(j.error || `Request failed (${r.status})`)
  if (typeof j.text !== 'string' || !j.text.trim()) {
    throw new Error('Empty response')
  }
  return j.text.trim()
}

export function aiAssistAvailable(): boolean {
  return isNeonSyncEnabled()
}

export async function requestPassportCurate(payload: {
  stamps: Array<{ id: string; label: string; detail: string }>
  yearCards: Record<number, Array<{ id: string; headline: string; sub?: string }>>
  contextDigest: string
}): Promise<{
  stampDetails: Record<string, unknown>
  yearCards: Record<string, unknown>
}> {
  const yearCards: Record<string, Array<{ id: string; headline: string; sub?: string }>> = {}
  for (const [y, cards] of Object.entries(payload.yearCards)) {
    yearCards[y] = cards
  }
  const r = await fetch(apiUrl('/api/ai'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...syncHeaders(),
    },
    body: JSON.stringify({
      action: 'passport_curate',
      stamps: payload.stamps,
      yearCards,
      contextDigest: payload.contextDigest,
    }),
  })
  const j = (await readJsonBody(r)) as {
    stampDetails?: Record<string, unknown>
    yearCards?: Record<string, unknown>
    error?: string
  }
  if (!r.ok) throw new Error(j.error || `Request failed (${r.status})`)
  return {
    stampDetails: j.stampDetails ?? {},
    yearCards: j.yearCards ?? {},
  }
}

export async function requestPassportKindCurate(payload: {
  kind: string
  moments: Array<{
    id: string
    title: string
    visitedAt: string
    tripName: string
    destName: string
    placeLabel?: string
    summaryLine: string
  }>
}): Promise<{
  momentLines: Record<string, string>
  orderedIds: string[]
  kindBlurb?: string
}> {
  const r = await fetch(apiUrl('/api/ai'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...syncHeaders(),
    },
    body: JSON.stringify({
      action: 'passport_kind_curate',
      kind: payload.kind,
      moments: payload.moments,
    }),
  })
  const j = (await readJsonBody(r)) as {
    momentLines?: Record<string, string>
    orderedIds?: string[]
    kindBlurb?: string
    error?: string
  }
  if (!r.ok) throw new Error(j.error || `Request failed (${r.status})`)
  return {
    momentLines: j.momentLines ?? {},
    orderedIds: j.orderedIds ?? payload.moments.map((m) => m.id),
    kindBlurb: j.kindBlurb,
  }
}
