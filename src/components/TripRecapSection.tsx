import { useMemo, useState } from 'react'
import { KIND_LABEL } from '../lib/kindMeta'
import { TRIPLESS_TRIP_ID } from '../lib/tripless'
import {
  aiAssistAvailable,
  requestTripRecap,
  type TripRecapMomentPayload,
} from '../lib/aiClient'
import type { Destination, Memory, Trip } from '../types'
import { useTravel } from '../store/travelStore'

function bodySnippet(body: string | undefined, max = 140): string | undefined {
  if (!body?.trim()) return undefined
  const t = body.trim().replace(/\s+/g, ' ')
  return t.length <= max ? t : `${t.slice(0, max).trimEnd()}…`
}

function tagLine(m: Memory): string[] | undefined {
  const tags = m.categoryTags
  if (!tags) return undefined
  const flat = Object.values(tags).flat().filter(Boolean)
  return flat.length ? flat : undefined
}

function buildPayload(
  trip: Trip,
  memories: Memory[],
  destinations: Destination[]
): TripRecapMomentPayload[] {
  const destName = (id: string) =>
    destinations.find((d) => d.id === id)?.name ?? 'Place'
  return [...memories]
    .filter((m) => m.tripId === trip.id)
    .sort((a, b) => Date.parse(b.visitedAt) - Date.parse(a.visitedAt))
    .map((m) => ({
      visitedAt: new Date(m.visitedAt).toLocaleDateString(undefined, {
        dateStyle: 'medium',
      }),
      kind: KIND_LABEL[m.kind],
      title: m.title,
      destinationName: destName(m.destinationId),
      placeLabel: m.placeLabel?.trim() || undefined,
      bodySnippet: bodySnippet(m.body),
      tags: tagLine(m),
    }))
}

export function TripRecapSection({ tripId }: { tripId: string }) {
  const { state, updateTrip } = useTravel()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trip = state.trips.find((t) => t.id === tripId)
  const payload = useMemo(() => {
    if (!trip) return []
    return buildPayload(trip, state.memories, state.destinations)
  }, [trip, state.memories, state.destinations])

  if (!trip || tripId === TRIPLESS_TRIP_ID || !aiAssistAvailable()) {
    return null
  }

  const onGenerate = async () => {
    setError(null)
    if (payload.length === 0) {
      setError('Add at least one moment on this trip first.')
      return
    }
    setLoading(true)
    try {
      const text = await requestTripRecap(trip.name, payload)
      updateTrip({ ...trip, recapBlurb: text })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate recap.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="journal-trip-recap" aria-label="Trip recap">
      <div className="journal-trip-recap-head">
        <h2 className="journal-trip-recap-title">Trip recap</h2>
        <button
          type="button"
          className="btn-secondary"
          disabled={loading}
          onClick={() => void onGenerate()}
        >
          {loading ? 'Writing…' : trip.recapBlurb ? 'Regenerate' : 'Write recap'}
        </button>
      </div>
      <p className="form-hint journal-trip-recap-hint">
        One short paragraph from your moments. Uses your Anthropic key on the
        server — only runs when you click.
      </p>
      {error ? <p className="form-error journal-trip-recap-error">{error}</p> : null}
      {trip.recapBlurb ? (
        <p className="journal-trip-recap-body">{trip.recapBlurb}</p>
      ) : null}
    </section>
  )
}
