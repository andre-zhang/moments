import type { MemoryKind } from '../types'

export const KIND_LABEL: Record<MemoryKind, string> = {
  flight: 'Flight',
  hotel: 'Hotel',
  restaurant: 'Restaurant',
  sight: 'Sight',
  note: 'Note',
}

export const KIND_EMOJI: Record<MemoryKind, string> = {
  flight: '✈️',
  hotel: '🏨',
  restaurant: '🍽️',
  sight: '📍',
  note: '📝',
}
