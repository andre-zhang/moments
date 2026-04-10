import type { Memory, MemoryKind } from '../types'
import { formatDurationMinutes } from './flightDuration'
import { haversineKm } from './geo'

function parseDay(iso: string): number {
  const t = Date.parse(iso)
  return Number.isFinite(t) ? Math.floor(t / 86_400_000) : NaN
}

export function hotelNightsForMemory(m: Memory): number {
  if (m.kind !== 'hotel') return 0
  const h = m.hotelDetails
  if (h?.nights != null && h.nights > 0) return Math.round(h.nights)
  if (h?.checkIn && h?.checkOut) {
    const a = parseDay(h.checkIn)
    const b = parseDay(h.checkOut)
    if (Number.isFinite(a) && Number.isFinite(b) && b >= a) return b - a
  }
  return 1
}

export function flightKmForMemory(m: Memory): number {
  if (m.kind !== 'flight' || !m.flightDetails) return 0
  const f = m.flightDetails
  if (f.distanceKm != null && f.distanceKm > 0) return f.distanceKm
  const { fromLat, fromLng, toLat, toLng } = f
  if (
    fromLat != null &&
    fromLng != null &&
    toLat != null &&
    toLng != null
  ) {
    return Math.round(haversineKm(fromLat, fromLng, toLat, toLng))
  }
  return 0
}

export interface ModeStats {
  kind: MemoryKind
  label: string
  count: number
  /** Kind-specific primary metric */
  primaryLabel: string
  primaryValue: string
}

const KIND_LABEL: Record<MemoryKind, string> = {
  flight: 'Flights',
  hotel: 'Hotels',
  restaurant: 'Restaurants',
  sight: 'Sights',
  note: 'Notes',
}

export function computeModeStats(memories: Memory[]): ModeStats[] {
  const kinds: MemoryKind[] = [
    'flight',
    'hotel',
    'restaurant',
    'sight',
    'note',
  ]
  return kinds.map((kind) => {
    const subset = memories.filter((m) => m.kind === kind)
    let primaryLabel = 'Moments'
    let primaryValue = String(subset.length)
    if (kind === 'flight') {
      const km = subset.reduce((s, m) => s + flightKmForMemory(m), 0)
      primaryLabel = 'Total flight km'
      primaryValue = km > 0 ? `${km.toLocaleString()} km` : '—'
    } else if (kind === 'hotel') {
      const nights = subset.reduce((s, m) => s + hotelNightsForMemory(m), 0)
      primaryLabel = 'Total hotel nights'
      primaryValue = nights > 0 ? `${nights} nights` : '—'
    } else if (kind === 'restaurant') {
      const again = subset.filter(
        (m) => m.restaurantDetails?.wouldEatAgain === true
      ).length
      primaryLabel = 'Would eat again'
      primaryValue = `${again} places`
    }
    return {
      kind,
      label: KIND_LABEL[kind],
      count: subset.length,
      primaryLabel,
      primaryValue,
    }
  })
}

export interface YearInReviewCard {
  id: string
  headline: string
  sub?: string
}

function memoryYear(iso: string): number | null {
  const y = new Date(iso).getFullYear()
  return Number.isFinite(y) && y > 1900 ? y : null
}

export function computeYearInReview(
  memories: Memory[],
  year: number
): YearInReviewCard[] {
  const yMem = memories.filter((m) => memoryYear(m.visitedAt) === year)
  const cards: YearInReviewCard[] = []

  const eatAgain = yMem.filter(
    (m) =>
      m.kind === 'restaurant' && m.restaurantDetails?.wouldEatAgain === true
  ).length
  if (eatAgain > 0) {
    cards.push({
      id: 'eat-again',
      headline: `You’d eat again at ${eatAgain} place${eatAgain === 1 ? '' : 's'}.`,
      sub: 'Restaurants you marked “would eat again.”',
    })
  }

  let bestFlight: Memory | null = null
  let bestScore = -1
  for (const m of yMem) {
    if (m.kind !== 'flight') continue
    const km = flightKmForMemory(m)
    const dur = m.flightDetails?.durationMinutes ?? 0
    const score = km > 0 ? km : dur
    if (score > bestScore) {
      bestScore = score
      bestFlight = m
    }
  }
  if (bestFlight && bestScore > 0) {
    const km = flightKmForMemory(bestFlight)
    const route =
      bestFlight.flightDetails?.fromCode && bestFlight.flightDetails?.toCode
        ? `${bestFlight.flightDetails.fromCode} → ${bestFlight.flightDetails.toCode}`
        : bestFlight.title
    cards.push({
      id: 'dramatic-flight',
      headline: 'Your most dramatic flight was…',
      sub:
        km > 0
          ? `${route} — about ${km.toLocaleString()} km.`
          : (() => {
              const d = formatDurationMinutes(
                bestFlight.flightDetails?.durationMinutes
              )
              return d
                ? `${route} — about ${d} in the air.`
                : `${route}.`
            })(),
    })
  }

  const hotelNights = yMem.reduce((s, m) => s + hotelNightsForMemory(m), 0)
  if (hotelNights > 0) {
    cards.push({
      id: 'hotel-nights',
      headline: `You logged ${hotelNights} hotel night${hotelNights === 1 ? '' : 's'} in ${year}.`,
    })
  }

  const countries = new Set(
    yMem.map((m) => m.countryCode).filter(Boolean) as string[]
  )
  if (countries.size > 0) {
    cards.push({
      id: 'countries',
      headline: `Pins across ${countries.size} countries.`,
    })
  }

  const flights = yMem.filter((m) => m.kind === 'flight').length
  if (flights > 0) {
    const totalKm = yMem.reduce((s, m) => s + flightKmForMemory(m), 0)
    cards.push({
      id: 'flight-count',
      headline: `${flights} flight${flights === 1 ? '' : 's'} in ${year}.`,
      sub: totalKm > 0 ? `Roughly ${totalKm.toLocaleString()} km flown.` : undefined,
    })
  }

  if (cards.length === 0 && yMem.length > 0) {
    cards.push({
      id: 'generic',
      headline: `${yMem.length} moments in ${year}.`,
      sub: 'Keep tagging countries and flights for richer cards.',
    })
  }

  return cards
}
