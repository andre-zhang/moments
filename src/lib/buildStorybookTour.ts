import type { Destination, Memory, Trip } from '../types'

function localDayStartMs(isoDate: string): number {
  const [y, mo, d] = isoDate.split('-').map(Number)
  if (!y || !mo || !d) return NaN
  return new Date(y, mo - 1, d).setHours(0, 0, 0, 0)
}

function localDayEndMs(isoDate: string): number {
  const [y, mo, d] = isoDate.split('-').map(Number)
  if (!y || !mo || !d) return NaN
  return new Date(y, mo - 1, d).setHours(23, 59, 59, 999)
}

export type StorybookFilter =
  | { mode: 'trip'; tripId: string }
  | { mode: 'range'; fromIso: string; toIso: string }

/** One slide per memory, chronological order. */
export interface StorybookTourStep {
  memory: Memory
  placeName: string
  tripName: string
  lat: number
  lng: number
}

function tripName(trips: Trip[], id: string): string {
  return trips.find((t) => t.id === id)?.name ?? ''
}

function destName(destinations: Destination[], id: string): string {
  return destinations.find((d) => d.id === id)?.name ?? 'Place'
}

export function filterMemoriesForStory(
  memories: Memory[],
  filter: StorybookFilter
): Memory[] {
  let list = memories
  if (filter.mode === 'trip') {
    list = list.filter((m) => m.tripId === filter.tripId)
  } else {
    const start = localDayStartMs(filter.fromIso)
    const end = localDayEndMs(filter.toIso)
    if (!Number.isFinite(start) || !Number.isFinite(end)) return []
    const lo = Math.min(start, end)
    const hi = Math.max(start, end)
    list = list.filter((m) => {
      const t = Date.parse(m.visitedAt)
      return Number.isFinite(t) && t >= lo && t <= hi
    })
  }
  return [...list].sort(
    (a, b) => Date.parse(a.visitedAt) - Date.parse(b.visitedAt)
  )
}

export function buildStorybookSteps(
  memories: Memory[],
  destinations: Destination[],
  trips: Trip[],
  filter: StorybookFilter
): StorybookTourStep[] {
  const filtered = filterMemoriesForStory(memories, filter)
  if (filtered.length === 0) return []

  return filtered.map((memory) => ({
    memory,
    placeName: destName(destinations, memory.destinationId),
    tripName: tripName(trips, memory.tripId),
    lat: memory.lat,
    lng: memory.lng,
  }))
}
