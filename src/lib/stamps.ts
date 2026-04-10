import type { Memory } from '../types'

/** Groups for passport milestones (stamp book view). */
export type StampGroup = 'journey' | 'places' | 'geography'

export const STAMP_GROUP_ORDER: StampGroup[] = [
  'journey',
  'places',
  'geography',
]

export const STAMP_GROUP_LABEL: Record<StampGroup, string> = {
  journey: 'Your story',
  places: 'Trips & places',
  geography: 'On the map',
}

export interface Stamp {
  id: string
  label: string
  detail: string
  earnedAt: string
  group: StampGroup
}

function sortByVisited(a: Memory, b: Memory): number {
  return Date.parse(a.visitedAt) - Date.parse(b.visitedAt)
}

/**
 * A small set of passport milestones (no per-trip / per-destination spam).
 * At most four stamps: timeline start, optional first flight, trip atlas, optional geography.
 */
export function computeStamps(memories: Memory[]): Stamp[] {
  if (memories.length === 0) return []

  const sorted = [...memories].sort(sortByVisited)
  const first = sorted[0]!
  const latest = sorted[sorted.length - 1]!
  const stamps: Stamp[] = []

  stamps.push({
    id: 'timeline-start',
    label: 'Where it began',
    detail: first.title,
    earnedAt: first.visitedAt,
    group: 'journey',
  })

  const firstFlight = sorted.find((m) => m.kind === 'flight')
  if (firstFlight) {
    stamps.push({
      id: `first-flight-${firstFlight.id}`,
      label: 'First flight logged',
      detail: firstFlight.title,
      earnedAt: firstFlight.visitedAt,
      group: 'journey',
    })
  }

  const tripIds = new Set(sorted.map((m) => m.tripId))
  const destKeys = new Set(sorted.map((m) => `${m.tripId}:${m.destinationId}`))
  const tripCount = tripIds.size
  const destCount = destKeys.size
  stamps.push({
    id: 'atlas-trips-destinations',
    label: 'Trip atlas',
    detail:
      tripCount === 1 && destCount === 1
        ? '1 trip · 1 place'
        : `${tripCount} trip${tripCount === 1 ? '' : 's'} · ${destCount} destination${destCount === 1 ? '' : 's'}`,
    earnedAt: latest.visitedAt,
    group: 'places',
  })

  const withCountry = sorted.filter((m) => m.countryCode)
  const countries = new Set(withCountry.map((m) => m.countryCode!))
  const regionKeys = new Set<string>()
  for (const m of withCountry) {
    if (m.adminRegion && m.countryCode) {
      regionKeys.add(`${m.countryCode}:${m.adminRegion}`)
    }
  }

  if (countries.size > 0) {
    const codes = [...countries].sort()
    const regionPart =
      regionKeys.size > 0
        ? ` · ${regionKeys.size} region${regionKeys.size === 1 ? '' : 's'}`
        : ''
    const preview =
      codes.length <= 4
        ? codes.join(', ')
        : `${codes.slice(0, 3).join(', ')} … +${codes.length - 3}`

    stamps.push({
      id: 'footprint-geography',
      label: 'World footprint',
      detail: `${countries.size} countr${countries.size === 1 ? 'y' : 'ies'} (${preview})${regionPart}`,
      earnedAt: latest.visitedAt,
      group: 'geography',
    })
  }

  return stamps.sort(
    (a, b) => Date.parse(a.earnedAt) - Date.parse(b.earnedAt)
  )
}
