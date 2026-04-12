import { useState } from 'react'
import { requestPassportKindCurate, aiAssistAvailable } from '../lib/aiClient'
import type { PassportAiCurations } from '../lib/passportCurations'
import { passportMomentSummary } from '../lib/passportSummary'
import type { Memory, MemoryKind } from '../types'
import { useTravel } from '../store/travelStore'

export function PassportKindCurateBar({
  kind,
  momentsNewestFirst,
  tripName,
  destName,
}: {
  kind: MemoryKind
  momentsNewestFirst: Memory[]
  tripName: (id: string) => string
  destName: (id: string) => string
}) {
  const { state, setPassportCurations } = useTravel()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!aiAssistAvailable() || momentsNewestFirst.length === 0) return null

  const onCurate = async () => {
    setError(null)
    setLoading(true)
    try {
      const moments = momentsNewestFirst.map((m) => ({
        id: m.id,
        title: m.title,
        visitedAt: m.visitedAt,
        tripName: tripName(m.tripId),
        destName: destName(m.destinationId),
        placeLabel: m.placeLabel?.trim(),
        summaryLine: passportMomentSummary(m),
      }))
      const res = await requestPassportKindCurate({ kind, moments })
      const { passportCurations } = state
      const nextLines = { ...passportCurations?.momentPassportLines }
      for (const m of momentsNewestFirst) {
        const line = res.momentLines[m.id]
        if (line) nextLines[m.id] = line
      }
      const nextBlurbs = { ...passportCurations?.kindBlurbs }
      if (res.kindBlurb !== undefined) {
        if (res.kindBlurb.trim()) nextBlurbs[kind] = res.kindBlurb.trim()
        else delete nextBlurbs[kind]
      }

      const next: PassportAiCurations = {
        ...passportCurations,
        updatedAt: new Date().toISOString(),
        momentPassportLines:
          Object.keys(nextLines).length > 0 ? nextLines : undefined,
        kindMomentOrder: {
          ...passportCurations?.kindMomentOrder,
          [kind]: res.orderedIds,
        },
        kindBlurbs:
          Object.keys(nextBlurbs).length > 0 ? nextBlurbs : undefined,
      }
      setPassportCurations(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Curate failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="passport-kind-curate-bar">
      <button
        type="button"
        className="btn-secondary"
        disabled={loading}
        onClick={() => void onCurate()}
      >
        {loading ? 'Curating…' : 'Curate this spread'}
      </button>
      {error ? (
        <p className="form-error passport-kind-curate-error">{error}</p>
      ) : null}
    </div>
  )
}
