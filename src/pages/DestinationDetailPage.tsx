import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { getPageMasthead } from '../lib/demoSamplePhotos'
import { KIND_EMOJI, KIND_LABEL } from '../lib/kindMeta'
import { TRIPLESS_TRIP_ID } from '../lib/tripless'
import { useTravel } from '../store/travelStore'

export function DestinationDetailPage() {
  const { destinationId } = useParams<{ destinationId: string }>()
  const { state } = useTravel()

  const dest = state.destinations.find((d) => d.id === destinationId)
  const trip = dest
    ? state.trips.find((t) => t.id === dest.tripId)
    : undefined

  const memories = useMemo(() => {
    if (!destinationId) return []
    return [...state.memories]
      .filter((m) => m.destinationId === destinationId)
      .sort((a, b) => Date.parse(b.visitedAt) - Date.parse(a.visitedAt))
  }, [state.memories, destinationId])

  const placeBanner = useMemo(
    () => getPageMasthead('destination-detail-hero', 'places'),
    []
  )

  if (!destinationId || !dest) {
    return (
      <div className="page destination-detail-page">
        <p className="form-hint">Place not found.</p>
        <Link to="/places" className="btn-primary">
          Back to places
        </Link>
      </div>
    )
  }

  return (
    <div className="page destination-detail-page">
      <PageHeader
        preTitle={
          <p className="destination-detail-back">
            <Link to="/places">Places</Link>
          </p>
        }
        title={dest.name}
        banner={placeBanner}
        subtitle={
          <p className="page-subtitle destination-detail-trip">
            <Link to={`/places?trip=${encodeURIComponent(dest.tripId)}`}>
              {trip?.name ?? 'Trip'}
            </Link>
            {dest.tripId !== TRIPLESS_TRIP_ID ? (
              <>
                {' · '}
                <Link
                  to={`/storybook?trip=${encodeURIComponent(dest.tripId)}&replay=1`}
                >
                  Storybook
                </Link>
              </>
            ) : null}
            {' · '}
            {memories.length} moment{memories.length === 1 ? '' : 's'}
          </p>
        }
      />

      {memories.length === 0 ? (
        <p className="form-hint">
          <Link to="/add/moment">Add a moment</Link> for this place.
        </p>
      ) : (
        <ul className="destination-moment-list">
          {memories.map((m) => (
            <li key={m.id}>
              <Link
                to={`/moment/${encodeURIComponent(m.id)}?from=places`}
                className="destination-moment-row"
              >
                <span className="destination-moment-emoji" title={KIND_LABEL[m.kind]}>
                  {m.pinEmoji?.trim() || KIND_EMOJI[m.kind]}
                </span>
                <span className="destination-moment-body">
                  <span className="destination-moment-title">{m.title}</span>
                  <span className="destination-moment-meta">
                    {new Date(m.visitedAt).toLocaleDateString(undefined, {
                      dateStyle: 'medium',
                    })}{' '}
                    · {KIND_LABEL[m.kind]}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
