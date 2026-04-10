import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { KIND_EMOJI, KIND_LABEL } from '../lib/kindMeta'
import {
  readPassportViewMode,
  type PassportViewMode,
} from '../lib/passportViewMode'
import { computeInsightsForKind } from '../lib/passportKindInsights'
import { passportMomentSummary } from '../lib/passportSummary'
import type { MemoryKind } from '../types'
import { useTravel } from '../store/travelStore'

const KINDS: MemoryKind[] = [
  'flight',
  'hotel',
  'restaurant',
  'sight',
  'note',
]

function isMemoryKind(s: string | undefined): s is MemoryKind {
  return Boolean(s && KINDS.includes(s as MemoryKind))
}

export function PassportKindPage() {
  const { kind: kindParam } = useParams<{ kind: string }>()
  const { state } = useTravel()
  const kind = isMemoryKind(kindParam) ? kindParam : null

  const [viewMode] = useState<PassportViewMode>(() => readPassportViewMode())
  const book = viewMode === 'book'

  const list = useMemo(() => {
    if (!kind) return []
    return [...state.memories]
      .filter((m) => m.kind === kind)
      .sort((a, b) => Date.parse(b.visitedAt) - Date.parse(a.visitedAt))
  }, [state.memories, kind])

  const insightCards = useMemo(() => {
    if (!kind) return []
    return computeInsightsForKind(kind, list, state.memories)
  }, [kind, list, state.memories])

  if (!kind) {
    return (
      <div className="page passport-kind-page">
        <p className="form-hint">Unknown category.</p>
        <Link to="/passport" className="btn-primary">
          Passport
        </Link>
      </div>
    )
  }

  const tripName = (id: string) =>
    state.trips.find((t) => t.id === id)?.name ?? id

  return (
    <div
      className={`page passport-kind-page${book ? ' passport-page--book' : ' passport-page--simple'}`}
    >
      <header className={`page-hero passport-kind-hero${book ? ' passport-kind-hero--book' : ''}`}>
        <p className="friend-detail-back">
          <Link to="/passport">Passport</Link>
        </p>
        {book ? (
          <p className="passport-kind-kicker">
            <span className="passport-kind-kicker-emoji" aria-hidden>
              {KIND_EMOJI[kind]}
            </span>{' '}
            Entry spread
          </p>
        ) : null}
        <h1 className={`page-title${book ? ' passport-title' : ''}`}>
          {KIND_LABEL[kind]}
        </h1>
        <p className={book ? 'passport-kind-subtitle' : 'page-subtitle'}>
          {list.length} moment{list.length === 1 ? '' : 's'}
        </p>
      </header>

      {insightCards.length > 0 ? (
        <section
          className={`passport-kind-insights${book ? ' passport-kind-insights--book' : ''}`}
          aria-label="Highlights"
        >
          <ul className="passport-kind-insights-grid">
            {insightCards.map((c) => (
              <li
                key={c.id}
                className={`passport-kind-insight-card${book ? ' passport-kind-insight-card--visa' : ''}`}
              >
                {book ? (
                  <span className="passport-kind-visa-chip" aria-hidden>
                    VISA
                  </span>
                ) : null}
                <span className="passport-kind-insight-label">{c.label}</span>
                <span className="passport-kind-insight-value">{c.value}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {list.length === 0 ? (
        <p className="form-hint">
          Nothing here yet. Use <strong>+</strong> in the header for a{' '}
          <Link to="/add/trip">trip</Link> or <Link to="/add/moment">moment</Link>
          . Trips, places, and friends live under{' '}
          <Link to="/places">Places &amp; people</Link>.
        </p>
      ) : (
        <ul
          className={`passport-kind-list${book ? ' passport-kind-list--book' : ''}`}
        >
          {list.map((m) => (
            <li key={m.id}>
              <Link
                to={`/moment/${encodeURIComponent(m.id)}?from=passport&kind=${encodeURIComponent(kind)}`}
                className={`passport-kind-row${book ? ' passport-kind-row--stamp' : ''}`}
              >
                <span className="passport-kind-row-title">{m.title}</span>
                <span className="passport-kind-row-sub">
                  {passportMomentSummary(m)}
                </span>
                <span className="passport-kind-row-meta">
                  {new Date(m.visitedAt).toLocaleDateString(undefined, {
                    dateStyle: 'medium',
                  })}
                  {' · '}
                  {tripName(m.tripId)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
