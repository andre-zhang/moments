import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { MemoryDetailRead } from '../components/MemoryDetailRead'
import { IconChevronLeft } from '../components/Icons'
import { KIND_EMOJI, KIND_LABEL } from '../lib/kindMeta'
import { readPassportViewMode } from '../lib/passportViewMode'
import type { MemoryKind } from '../types'
import { useTravel } from '../store/travelStore'

const PASSPORT_KINDS: MemoryKind[] = [
  'flight',
  'hotel',
  'restaurant',
  'sight',
  'note',
]

function parsePassportKind(param: string | null): MemoryKind | null {
  if (!param) return null
  return PASSPORT_KINDS.includes(param as MemoryKind)
    ? (param as MemoryKind)
    : null
}

function backTarget(
  from: string | null,
  passportKind: MemoryKind | null
): { to: string; label: string } {
  switch (from) {
    case 'map':
      return { to: '/map', label: 'Map' }
    case 'passport':
      if (passportKind)
        return {
          to: `/passport/${passportKind}`,
          label: KIND_LABEL[passportKind],
        }
      return { to: '/passport', label: 'Passport' }
    case 'friends':
      return { to: '/friends', label: 'Friends' }
    case 'places':
      return { to: '/places', label: 'Places' }
    default:
      return { to: '/', label: 'Journal' }
  }
}

/** Top nav already links to Journal; hide duplicate "← Journal" on this page. */
function showMomentBackBar(back: { to: string; label: string }): boolean {
  return !(back.to === '/' && back.label === 'Journal')
}

export function MomentDetailPage() {
  const { memoryId } = useParams<{ memoryId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { state, deleteMemory } = useTravel()

  const memory = state.memories.find((m) => m.id === memoryId)
  const tripName = (id: string) =>
    state.trips.find((t) => t.id === id)?.name ?? id
  const destName = (id: string) =>
    state.destinations.find((d) => d.id === id)?.name ?? 'Place'

  const from = searchParams.get('from')
  const passportKind = parsePassportKind(searchParams.get('kind'))
  const back = backTarget(from, passportKind)
  const passportView = from === 'passport' ? readPassportViewMode() : null
  const passportBook = passportView === 'book'
  const passportSimple = passportView === 'simple'

  if (!memoryId || !memory) {
    return (
      <div className="page moment-detail-page">
        <p className="form-hint">That moment is not in your journal.</p>
        <Link to="/" className="btn-primary">
          Journal
        </Link>
      </div>
    )
  }

  const pageClass = [
    'page moment-detail-page',
    passportBook ? 'passport-page--book' : '',
    passportSimple ? 'passport-page--simple' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const detail = (
    <MemoryDetailRead
      memory={memory}
      tagCategories={state.tagCategories}
      friends={state.friends}
      tripName={tripName(memory.tripId)}
      destName={destName(memory.destinationId)}
      tripId={memory.tripId}
      showMapLink
      variant={passportBook ? 'passport-stamp' : 'default'}
      onDelete={() => {
        deleteMemory(memory.id)
        navigate(back.to)
      }}
    />
  )

  return (
    <div className={pageClass}>
      {showMomentBackBar(back) ? (
        <p className="moment-detail-back">
          <Link to={back.to} className="moment-detail-back-link">
            <IconChevronLeft className="moment-detail-back-icon" />
            {back.label}
          </Link>
        </p>
      ) : null}
      {passportBook ? (
        <>
          <p className="passport-moment-kicker">
            <span className="passport-moment-kicker-emoji" aria-hidden>
              {memory.pinEmoji?.trim() || KIND_EMOJI[memory.kind]}
            </span>{' '}
            Entry
          </p>
          <div className="passport-moment-stamp-sheet">{detail}</div>
        </>
      ) : passportSimple ? (
        <div className="passport-moment-simple-sheet">{detail}</div>
      ) : (
        detail
      )}
    </div>
  )
}
