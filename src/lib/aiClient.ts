import { apiUrl, isNeonSyncEnabled, syncHeaders } from './syncEnv'

export type TripRecapMomentPayload = {
  visitedAt: string
  kind: string
  title: string
  destinationName: string
  placeLabel?: string
  bodySnippet?: string
  tags?: string[]
}

export async function requestTripRecap(
  tripName: string,
  moments: TripRecapMomentPayload[]
): Promise<string> {
  const r = await fetch(apiUrl('/api/ai'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...syncHeaders(),
    },
    body: JSON.stringify({
      action: 'trip_recap',
      tripName,
      moments,
    }),
  })
  const j = (await r.json()) as { text?: string; error?: string }
  if (!r.ok) throw new Error(j.error || `Request failed (${r.status})`)
  if (typeof j.text !== 'string' || !j.text.trim()) {
    throw new Error('Empty response')
  }
  return j.text.trim()
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
  const j = (await r.json()) as { text?: string; error?: string }
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
  const j = (await r.json()) as {
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
  const j = (await r.json()) as {
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
