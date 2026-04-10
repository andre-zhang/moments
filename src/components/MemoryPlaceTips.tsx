import { useState } from 'react'
import {
  aiAssistAvailable,
  requestPlaceTips,
} from '../lib/aiClient'
import type { Memory } from '../types'
import { useTravel } from '../store/travelStore'

function bodySnippet(body: string | undefined, max = 160): string | undefined {
  if (!body?.trim()) return undefined
  const t = body.trim().replace(/\s+/g, ' ')
  return t.length <= max ? t : `${t.slice(0, max).trimEnd()}…`
}

export function MemoryPlaceTips({
  memory,
  destinationName,
}: {
  memory: Memory
  destinationName: string
}) {
  const { updateMemory } = useTravel()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (
    (memory.kind !== 'restaurant' && memory.kind !== 'sight') ||
    !aiAssistAvailable()
  ) {
    return null
  }

  const onGenerate = async () => {
    setError(null)
    const kind = memory.kind
    if (kind !== 'restaurant' && kind !== 'sight') return
    setLoading(true)
    try {
      const text = await requestPlaceTips({
        kind,
        title: memory.title,
        destinationName,
        placeLabel: memory.placeLabel?.trim(),
        adminRegion: memory.adminRegion?.trim(),
        countryCode: memory.countryCode?.trim(),
        bodySnippet: bodySnippet(memory.body),
        restaurant:
          kind === 'restaurant' ? memory.restaurantDetails : undefined,
        sight: kind === 'sight' ? memory.sightDetails : undefined,
      })
      updateMemory({ ...memory, placeTipsBlurb: text })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate ideas.')
    } finally {
      setLoading(false)
    }
  }

  const label =
    memory.kind === 'restaurant' ? 'Order / vibe ideas' : 'Before-you-go ideas'

  return (
    <section className="memory-place-tips" aria-label={label}>
      <div className="memory-place-tips-head">
        <h3 className="memory-place-tips-title">{label}</h3>
        <button
          type="button"
          className="btn-secondary"
          disabled={loading}
          onClick={() => void onGenerate()}
        >
          {loading ? 'Thinking…' : memory.placeTipsBlurb ? 'Regenerate' : 'Draft ideas'}
        </button>
      </div>
      <p className="form-hint memory-place-tips-hint">
        Rough suggestions from what you logged — not facts. Only sent when you
        click.
      </p>
      {error ? <p className="form-error memory-place-tips-error">{error}</p> : null}
      {memory.placeTipsBlurb ? (
        <p className="memory-place-tips-body">{memory.placeTipsBlurb}</p>
      ) : null}
    </section>
  )
}
