import { aircraftLabel, cabinLabel } from '../data/aircraftTypes'
import { formatDurationMinutes } from './flightDuration'
import type { Memory } from '../types'

/** One-line context for passport lists */
export function passportMomentSummary(m: Memory): string {
  switch (m.kind) {
    case 'flight': {
      const f = m.flightDetails
      const bits: string[] = []
      if (f?.airline) bits.push(f.airline)
      if (f?.fromCode && f?.toCode)
        bits.push(`${f.fromCode} → ${f.toCode}`)
      const ac = aircraftLabel(f?.aircraftType)
      if (ac) bits.push(ac)
      const cab = cabinLabel(f?.cabinClass)
      if (cab) bits.push(cab)
      const dur = formatDurationMinutes(f?.durationMinutes)
      if (dur) bits.push(dur)
      if (f?.confirmationCode) bits.push(f.confirmationCode)
      return bits.join(' · ') || m.placeLabel || ''
    }
    case 'hotel': {
      const h = m.hotelDetails
      const bits: string[] = []
      if (h?.brand) bits.push(h.brand)
      if (h?.stars != null && h.stars >= 1) bits.push(`${h.stars}★`)
      if (h?.roomType) bits.push(h.roomType)
      if (h?.nights != null && h.nights > 0) bits.push(`${h.nights} nights`)
      return bits.join(' · ') || m.placeLabel || ''
    }
    case 'restaurant': {
      const r = m.restaurantDetails
      const bits: string[] = []
      if (r?.cuisine) bits.push(r.cuisine)
      if (r?.venueStyle) bits.push(r.venueStyle)
      if (r?.rating != null) bits.push(`${r.rating}/5`)
      return bits.join(' · ') || m.placeLabel || ''
    }
    case 'sight': {
      const s = m.sightDetails
      const bits: string[] = []
      if (s?.venueType) bits.push(s.venueType)
      if (s?.highlights?.trim()) bits.push(s.highlights.trim().slice(0, 40))
      return bits.join(' · ') || m.placeLabel || ''
    }
    case 'note': {
      const t = m.noteDetails?.topic
      return t ? `${t}` : m.body?.slice(0, 80) ?? ''
    }
    default:
      return m.placeLabel || ''
  }
}
