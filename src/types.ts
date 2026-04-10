export type MemoryKind = 'flight' | 'hotel' | 'restaurant' | 'sight' | 'note'

export interface FlightDetails {
  fromCode?: string
  toCode?: string
  fromLat?: number
  fromLng?: number
  toLat?: number
  toLng?: number
  /** Block time / airborne time in minutes */
  durationMinutes?: number
  distanceKm?: number
  airline?: string
  /** Key from AIRCRAFT_TYPES */
  aircraftType?: string
  /** economy | premium_economy | business | first */
  cabinClass?: string
  /** PNR / record locator */
  confirmationCode?: string
}

export interface HotelDetails {
  checkIn?: string
  checkOut?: string
  nights?: number
  brand?: string
  /** 1–5 */
  stars?: number
  roomType?: string
}

export interface RestaurantDetails {
  rating?: number
  wouldEatAgain?: boolean
  /** Chain or style, e.g. izakaya, brasserie */
  venueStyle?: string
  /** e.g. Japanese, Italian */
  cuisine?: string
}

export interface SightDetails {
  /** e.g. museum, viewpoint, park */
  venueType?: string
  highlights?: string
}

export interface NoteDetails {
  /** Short label for passport lists */
  topic?: string
}

/** Customizable in Settings — vibe, mood, moment, activity chips */
export interface TagCategory {
  id: string
  label: string
  tags: string[]
  /** Per-tag hex colors, e.g. #5b21b6 (set in Settings → Tags) */
  tagColors?: Record<string, string>
  /** If set, chips only show for these moment kinds (omit = all kinds). */
  appliesToKinds?: MemoryKind[]
}

/**
 * Single-choice lists (e.g. cuisine) — options edited under Settings → Choice lists.
 */
export interface SelectionList {
  id: string
  label: string
  appliesToKinds: MemoryKind[]
  options: string[]
  optionColors?: Record<string, string>
}

export interface Friend {
  id: string
  name: string
  /** Accent hex #rrggbb (Friends page or Trips → Friends) */
  color?: string
}

export interface Memory {
  id: string
  tripId: string
  destinationId: string
  kind: MemoryKind
  title: string
  /** Display name from place search or free text */
  placeLabel?: string
  body?: string
  lat: number
  lng: number
  visitedAt: string
  /** Optional map pin override */
  pinEmoji?: string
  countryCode?: string
  adminRegion?: string
  flightDetails?: FlightDetails
  hotelDetails?: HotelDetails
  restaurantDetails?: RestaurantDetails
  sightDetails?: SightDetails
  noteDetails?: NoteDetails
  /** category id → selected tag labels (max 3 per category in UI) */
  categoryTags?: Record<string, string[]>
  /** Single choice per choice-list id (e.g. cuisine) */
  selectionListValues?: Record<string, string>
  /** Up to 8 friend ids */
  friendIds?: string[]
  /** Casual pre-visit ideas for restaurant/sight moments; generated on demand */
  placeTipsBlurb?: string
}

export interface Destination {
  id: string
  tripId: string
  name: string
}

export interface Trip {
  id: string
  name: string
  /** Short journal-style paragraph; generated on demand, stored with the trip */
  recapBlurb?: string
}
