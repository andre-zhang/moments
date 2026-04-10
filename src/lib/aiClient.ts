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
