import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { KIND_EMOJI, KIND_LABEL } from '../lib/kindMeta'
import {
  readPassportViewMode,
  type PassportViewMode,
} from '../lib/passportViewMode'
import { PassportKindCurateBar } from '../components/PassportKindCurateBar'
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

  const rawFiltered = useMemo(() => {
    if (!kind) return []
    return state.memories.filter((m) => m.kind === kind)
  }, [state.memories, kind])

  const momentsNewestFirst = useMemo(
    () =>
      [...rawFiltered].sort(
        (a, b) => Date.parse(b.visitedAt) - Date.parse(a.visitedAt)
      ),
    [rawFiltered]
  )

  const list = useMemo(() => {
    if (!kind) return []
    const order = state.passportCurations?.kindMomentOrder?.[kind]
    if (!order?.length) {
      return momentsNewestFirst
    }
    const idx = new Map(order.map((id, i) => [id, i]))
    return [...rawFiltered].sort((a, b) => {
      const ia = idx.get(a.id)
      const ib = idx.get(b.id)
      if (ia != null && ib != null && ia !== ib) return ia - ib
      if (ia != null && ib == null) return -1
      if (ia == null && ib != null) return 1
      return Date.parse(b.visitedAt) - Date.parse(a.visitedAt)
    })
  }, [rawFiltered, kind, state.passportCurations?.kindMomentOrder])

  const insightCards = useMemo(() => {
    if (!kind) return []
    return computeInsightsForKind(kind, rawFiltered, state.memories)
  }, [kind, rawFiltered, state.memories])

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

  const destName = (id: string) =>
    state.destinations.find((d) => d.id === id)?.name ?? id

  const kindHeaderBook = (
    <header className="page-hero passport-kind-hero passport-kind-hero--book">
      <p className="friend-detail-back">
        <Link to="/passport">Passport</Link>
      </p>
      <p className="passport-kind-kicker">
        <span className="passport-kind-kicker-emoji" aria-hidden>
          {KIND_EMOJI[kind]}
        </span>{' '}
        Entry spread
      </p>
      <h1 className="page-title passport-title">{KIND_LABEL[kind]}</h1>
      {state.passportCurations?.kindBlurbs?.[kind]?.trim() ? (
        <p className="passport-kind-ai-blurb">
          {state.passportCurations.kindBlurbs[kind]}
        </p>
      ) : null}
      <p className="passport-kind-subtitle">
        {list.length} moment{list.length === 1 ? '' : 's'}
      </p>
      <PassportKindCurateBar
        kind={kind}
        momentsNewestFirst={momentsNewestFirst}
        tripName={tripName}
        destName={destName}
      />
    </header>
  )

  const kindHeaderSimple = (
    <PageHeader
      preTitle={
        <p className="friend-detail-back">
          <Link to="/passport">Passport</Link>
        </p>
      }
      title={KIND_LABEL[kind]}
      subtitle={
        <>
          {state.passportCurations?.kindBlurbs?.[kind]?.trim() ? (
            <p className="passport-kind-ai-blurb">
              {state.passportCurations.kindBlurbs[kind]}
            </p>
          ) : null}
          <p className="page-subtitle">
            {list.length} moment{list.length === 1 ? '' : 's'}
          </p>
          <PassportKindCurateBar
            kind={kind}
            momentsNewestFirst={momentsNewestFirst}
            tripName={tripName}
            destName={destName}
          />
        </>
      }
    />
  )

  return (
    <div
      className={`page passport-kind-page${book ? ' passport-page--book' : ' passport-page--simple'}`}
    >
      {book ? kindHeaderBook : kindHeaderSimple}

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
          Nothing here yet. Add a <Link to="/add/moment">moment</Link> or{' '}
          <Link to="/places">places &amp; people</Link>.
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
                  {state.passportCurations?.momentPassportLines?.[m.id] ??
                    passportMomentSummary(m)}
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
