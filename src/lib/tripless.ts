import type { Destination, Trip } from '../types'

export const TRIPLESS_TRIP_ID = '__tripless__'
export const TRIPLESS_DEFAULT_DEST_ID = '__tripless-general__'

export function triplessTrip(): Trip {
  return { id: TRIPLESS_TRIP_ID, name: 'Tripless moments' }
}

export function triplessDefaultDestination(): Destination {
  return {
    id: TRIPLESS_DEFAULT_DEST_ID,
    tripId: TRIPLESS_TRIP_ID,
    name: 'General',
  }
}

export function isTriplessTrip(tripId: string): boolean {
  return tripId === TRIPLESS_TRIP_ID
}

/** Ensures the default “no trip” bucket exists for moments. */
export function withTriplessInfrastructure<
  T extends { trips: Trip[]; destinations: Destination[] },
>(p: T): T {
  let trips = p.trips
  let destinations = p.destinations
  if (!trips.some((t) => t.id === TRIPLESS_TRIP_ID)) {
    trips = [triplessTrip(), ...trips]
  }
  if (!destinations.some((d) => d.id === TRIPLESS_DEFAULT_DEST_ID)) {
    destinations = [triplessDefaultDestination(), ...destinations]
  }
  return { ...p, trips, destinations }
}

export function sortTripsForDisplay(trips: Trip[]): Trip[] {
  return [...trips].sort((a, b) => {
    if (a.id === TRIPLESS_TRIP_ID) return -1
    if (b.id === TRIPLESS_TRIP_ID) return 1
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  })
}
