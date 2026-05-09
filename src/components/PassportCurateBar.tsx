import { useState } from 'react'
import { requestPassportCurate, aiAssistAvailable } from '../lib/aiClient'
import { KIND_LABEL } from '../lib/kindMeta'
import {
  pickStampDetailOverrides,
  type PassportAiCurations,
} from '../lib/passportCurations'
import { computeYearInReview } from '../lib/stats'
import { computeStamps } from '../lib/stamps'
import type { Destination, Memory, Trip } from '../types'
import { useTravel } from '../store/travelStore'

function yearOptions(memories: Memory[]): number[] {
  const ys = new Set<number>()
  for (const m of memories) {
    const y = new Date(m.visitedAt).getFullYear()
    if (y > 1900 && y < 3000) ys.add(y)
  }
  const list = [...ys].sort((a, b) => b - a)
  if (list.length === 0) list.push(new Date().getFullYear())
  return list
}

/** Most recent years sent to the model (avoids huge prompts / timeouts). */
const CURATE_YEAR_LIMIT = 24

function buildDigest(
  memories: Memory[],
  trips: Trip[],
  destinations: Destination[],
  max = 55
): string {
  const tripName = (id: string) => trips.find((t) => t.id === id)?.name ?? id
  const destName = (id: string) =>
    destinations.find((d) => d.id === id)?.name ?? id
  const slice = [...memories].sort(
    (a, b) => Date.parse(b.visitedAt) - Date.parse(a.visitedAt)
  )
  return slice
    .slice(0, max)
    .map(
      (m) =>
        `${m.title} | ${KIND_LABEL[m.kind]} | ${m.visitedAt.slice(0, 10)} | ${destName(m.destinationId)} | ${tripName(m.tripId)}`
    )
    .join('\n')
}

export function PassportCurateBar() {
  const { state, setPassportCurations } = useTravel()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { memories, trips, destinations, passportCurations } = state

  if (!aiAssistAvailable()) return null

  const onCurate = async () => {
    setError(null)
    if (memories.length === 0) {
      setError('Add moments first.')
      return
    }
    setLoading(true)
    try {
      const stamps = computeStamps(memories)
      const allYears = yearOptions(memories)
      const yearsForCurate = allYears.slice(0, CURATE_YEAR_LIMIT)
      const yearCards: Record<
        number,
        Array<{ id: string; headline: string; sub?: string }>
      > = {}
      for (const y of yearsForCurate) {
        yearCards[y] = computeYearInReview(memories, y)
      }

      const res = await requestPassportCurate({
        stamps: stamps.map((s) => ({
          id: s.id,
          label: s.label,
          detail: s.detail,
        })),
        yearCards,
        contextDigest: buildDigest(memories, trips, destinations),
      })

      const pick = pickStampDetailOverrides(stamps, res.stampDetails)
      const mergedStamps: Record<string, string> = {}
      for (const s of stamps) {
        const v = pick[s.id] ?? passportCurations?.stampDetails?.[s.id]
        if (typeof v === 'string' && v.trim()) mergedStamps[s.id] = v.trim()
      }

      const mergedYear: Record<
        number,
        Array<{ id: string; headline: string; sub?: string }>
      > = { ...(passportCurations?.yearCards ?? {}) }
      for (const y of yearsForCurate) {
        const raw = res.yearCards[String(y)]
        if (Array.isArray(raw) && raw.length > 0) {
          mergedYear[y] = raw.filter(
            (row): row is { id: string; headline: string; sub?: string } =>
              Boolean(
                row &&
                  typeof row === 'object' &&
                  typeof (row as { id?: string }).id === 'string' &&
                  typeof (row as { headline?: string }).headline === 'string'
              )
          ) as Array<{ id: string; headline: string; sub?: string }>
        }
      }

      const next: PassportAiCurations = {
        ...passportCurations,
        updatedAt: new Date().toISOString(),
        stampDetails:
          Object.keys(mergedStamps).length > 0 ? mergedStamps : undefined,
        yearCards:
          Object.keys(mergedYear).length > 0 ? mergedYear : undefined,
      }
      setPassportCurations(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Curate failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="passport-curate-bar">
      <button
        type="button"
        className="btn-primary"
        disabled={loading || memories.length === 0}
        onClick={() => void onCurate()}
      >
        {loading ? 'Curating…' : 'Curate stamps & year cards'}
      </button>
      {error ? <p className="form-error passport-curate-error">{error}</p> : null}
    </div>
  )
}
