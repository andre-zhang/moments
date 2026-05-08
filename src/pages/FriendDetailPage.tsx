import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { getPageMasthead } from '../lib/demoSamplePhotos'
import { fallbackFriendColor } from '../lib/colorAccent'
import { KIND_EMOJI, KIND_LABEL } from '../lib/kindMeta'
import { sortTripsForDisplay } from '../lib/tripless'
import { useTravel } from '../store/travelStore'

export function FriendDetailPage() {
  const { friendId } = useParams<{ friendId: string }>()
  const { state } = useTravel()
  const friend = state.friends.find((f) => f.id === friendId)

  const { byTrip, sortedTrips } = useMemo(() => {
    if (!friendId)
      return { byTrip: new Map<string, typeof state.memories>(), sortedTrips: [] }
    const withFriend = state.memories.filter((m) =>
      m.friendIds?.includes(friendId)
    )
    const map = new Map<string, typeof state.memories>()
    for (const m of withFriend) {
      const list = map.get(m.tripId) ?? []
      list.push(m)
      map.set(m.tripId, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => Date.parse(b.visitedAt) - Date.parse(a.visitedAt))
    }
    const tripIds = [...map.keys()]
    const order = new Map(
      sortTripsForDisplay(state.trips).map((t, i) => [t.id, i])
    )
    tripIds.sort(
      (a, b) => (order.get(a) ?? 99) - (order.get(b) ?? 99)
    )
    const trips = tripIds
      .map((id) => state.trips.find((t) => t.id === id))
      .filter(Boolean) as typeof state.trips
    return { byTrip: map, sortedTrips: trips }
  }, [friendId, state.memories, state.trips])

  if (!friendId || !friend) {
    return (
      <div className="page friend-detail-page">
        <p className="form-hint">Friend not found.</p>
        <Link to="/friends" className="btn-primary">
          Friends
        </Link>
      </div>
    )
  }

  const total = [...byTrip.values()].reduce((n, arr) => n + arr.length, 0)

  const friendBanner = useMemo(
    () => getPageMasthead('friend-detail-hero', 'friends'),
    []
  )

  return (
    <div className="page friend-detail-page">
      <PageHeader
        preTitle={
          <p className="friend-detail-back">
            <Link to="/friends">Friends</Link>
          </p>
        }
        banner={friendBanner}
        title={
          <span className="friend-detail-title-flex">
            <span
              className="friend-detail-accent-bar"
              style={{
                background: friend.color ?? fallbackFriendColor(friend.name),
              }}
              aria-hidden
            />
            <span>{friend.name}</span>
          </span>
        }
      />

      {total === 0 ? null : (
        <div className="friend-trip-sections">
          {sortedTrips.map((trip) => {
            const list = byTrip.get(trip.id) ?? []
            if (list.length === 0) return null
            return (
              <section key={trip.id} className="panel-block friend-trip-block">
                <h2 className="panel-block-title">
                  <Link to={`/places?trip=${encodeURIComponent(trip.id)}`}>
                    {trip.name}
                  </Link>
                </h2>
                <ul className="friend-moment-list">
                  {list.map((m) => (
                    <li key={m.id}>
                      <Link
                        to={`/moment/${encodeURIComponent(m.id)}?from=friends`}
                        className="friend-moment-row"
                      >
                        <span className="friend-moment-emoji" title={KIND_LABEL[m.kind]}>
                          {m.pinEmoji?.trim() || KIND_EMOJI[m.kind]}
                        </span>
                        <span className="friend-moment-body">
                          <span className="friend-moment-title">{m.title}</span>
                          <span className="friend-moment-meta">
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
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
