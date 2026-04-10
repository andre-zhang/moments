import { lookupIata } from '../data/iataAirports'
import type { Memory } from '../types'
import { greatCircleLatLngs } from './greatCircle'

function endpoint(
  lat: number | undefined,
  lng: number | undefined,
  code: string | undefined
): [number, number] | null {
  if (
    lat != null &&
    lng != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  ) {
    return [lat, lng]
  }
  const c = lookupIata(code)
  if (!c) return null
  return [c.lat, c.lng]
}

/** Both ends of a flight segment for map routing. */
export function resolveFlightEndpoints(m: Memory): {
  from: [number, number]
  to: [number, number]
} | null {
  if (m.kind !== 'flight' || !m.flightDetails) return null
  const f = m.flightDetails
  const from = endpoint(f.fromLat, f.fromLng, f.fromCode)
  const to = endpoint(f.toLat, f.toLng, f.toCode)
  if (!from || !to) return null
  return { from, to }
}

export function flightRoutePolyline(m: Memory): [number, number][] | null {
  const ends = resolveFlightEndpoints(m)
  if (!ends) return null
  return greatCircleLatLngs(ends.from, ends.to, 56)
}

export function flightLineColor(id: string): string {
  const palette = ['#0d9488', '#7c3aed', '#c2410c', '#0284c7', '#be123c', '#4d7c0f']
  let h = 0
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
  return palette[Math.abs(h) % palette.length]
}
