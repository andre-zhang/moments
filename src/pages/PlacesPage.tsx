import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { IconPencil } from '../components/Icons'
import { AmbientScenicTile } from '../components/AmbientScenicTile'
import {
  TRIPLESS_DEFAULT_DEST_ID,
  TRIPLESS_TRIP_ID,
  sortTripsForDisplay,
} from '../lib/tripless'
import { parseHex } from '../lib/colorAccent'
import { friendChipStyle } from '../lib/chipStyles'
import { useTravel } from '../store/travelStore'

export function PlacesPage() {
  const {
    state,
    addTrip,
    updateTrip,
    deleteTrip,
    addDestination,
    updateDestination,
    deleteDestination,
    addFriend,
    updateFriend,
  } = useTravel()

  const [searchParams] = useSearchParams()
  const highlightTripId = searchParams.get('trip')

  const [placesEdit, setPlacesEdit] = useState(false)
  const [peopleEdit, setPeopleEdit] = useState(false)

  const [tripName, setTripName] = useState('')
  const [friendName, setFriendName] = useState('')
  const [friendColorDraft, setFriendColorDraft] = useState('')
  const [destNameByTrip, setDestNameByTrip] = useState<Record<string, string>>(
    {}
  )

  const tripsSorted = sortTripsForDisplay(state.trips)

  const destRows = useMemo(() => {
    const order = new Map(tripsSorted.map((t, i) => [t.id, i]))
    const tripNameFn = (id: string) =>
      state.trips.find((t) => t.id === id)?.name ?? id
    return [...state.destinations]
      .sort((a, b) => {
        const oa = order.get(a.tripId) ?? 99
        const ob = order.get(b.tripId) ?? 99
        if (oa !== ob) return oa - ob
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      })
      .map((d) => ({
        dest: d,
        tripName: tripNameFn(d.tripId),
        count: state.memories.filter((m) => m.destinationId === d.id).length,
      }))
  }, [state.destinations, state.memories, state.trips, tripsSorted])

  const addTripSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = tripName.trim()
    if (!n) return
    addTrip({ id: `t-${crypto.randomUUID()}`, name: n })
    setTripName('')
  }

  const addFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = friendName.trim()
    if (!n) return
    const hex =
      friendColorDraft && parseHex(friendColorDraft) ? friendColorDraft : undefined
    addFriend({
      id: `f-${crypto.randomUUID()}`,
      name: n,
      ...(hex ? { color: hex } : {}),
    })
    setFriendName('')
    setFriendColorDraft('')
  }

  const addDest = (tripId: string) => {
    const n = (destNameByTrip[tripId] ?? '').trim()
    if (!n) return
    addDestination({
      id: `d-${crypto.randomUUID()}`,
      tripId,
      name: n,
    })
    setDestNameByTrip((p) => ({ ...p, [tripId]: '' }))
  }

  return (
    <div className="page places-page">
      <PageHeader className="places-hero" title="Places & people" />
      <div className="ambient-scenic-row" aria-hidden>
        <AmbientScenicTile seed="places-a" className="ambient-scenic--compact" />
        <AmbientScenicTile seed="places-b" className="ambient-scenic--compact" />
      </div>

      <div className="places-merged-stack">
        <section className="places-merged-panel">
          <div className="places-panel-head">
            <h2 className="places-panel-title">Places</h2>
            <button
              type="button"
              className="places-edit-btn"
              aria-pressed={placesEdit}
              aria-label={placesEdit ? 'Done editing places' : 'Edit trips and places'}
              title={placesEdit ? 'Done' : 'Edit'}
              onClick={() => setPlacesEdit((v) => !v)}
            >
              <IconPencil className="places-edit-icon" />
            </button>
          </div>

          {!placesEdit ? (
            destRows.length > 0 ? (
              <ul className="places-dest-grid">
                {destRows.map(({ dest, tripName: tn, count }) => (
                  <li key={dest.id}>
                    <Link
                      to={`/places/${encodeURIComponent(dest.id)}`}
                      className={`places-dest-card${highlightTripId === dest.tripId ? ' places-dest-card--hl' : ''}`}
                    >
                      <span className="places-dest-name">{dest.name}</span>
                      <span className="places-dest-trip">{tn}</span>
                      <span className="places-dest-count">
                        {count} moment{count === 1 ? '' : 's'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null
          ) : (
            <div className="places-edit-body">
              <form className="inline-form places-new-trip" onSubmit={addTripSubmit}>
                <input
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="New trip"
                  aria-label="New trip name"
                />
                <button type="submit" className="btn-primary">
                  Add trip
                </button>
              </form>
              <div className="trip-stack places-trip-stack">
                {tripsSorted.map((trip) => {
                  const dests = state.destinations.filter(
                    (d) => d.tripId === trip.id
                  )
                  const isTripless = trip.id === TRIPLESS_TRIP_ID
                  return (
                    <article
                      key={trip.id}
                      id={`trip-card-${trip.id}`}
                      className={`trip-card${highlightTripId === trip.id ? ' trip-card--highlight' : ''}`}
                    >
                      <div className="trip-card-head">
                        <input
                          className="trip-name-input"
                          value={trip.name}
                          onChange={(e) =>
                            updateTrip({ ...trip, name: e.target.value })
                          }
                          disabled={isTripless}
                          aria-label={
                            isTripless ? 'Trip name (built-in)' : 'Trip name'
                          }
                        />
                        {!isTripless ? (
                          <button
                            type="button"
                            className="link-delete"
                            onClick={() => {
                              if (
                                confirm(
                                  'Delete this trip, its places, moments, and photos?'
                                )
                              )
                                deleteTrip(trip.id)
                            }}
                          >
                            Delete trip
                          </button>
                        ) : (
                          <span className="form-hint">Built-in</span>
                        )}
                      </div>
                      <ul className="dest-list">
                        {dests.map((d) => (
                          <li key={d.id}>
                            <input
                              value={d.name}
                              onChange={(e) =>
                                updateDestination({ ...d, name: e.target.value })
                              }
                              disabled={d.id === TRIPLESS_DEFAULT_DEST_ID}
                              aria-label={`Place name: ${d.name}`}
                            />
                            {d.id === TRIPLESS_DEFAULT_DEST_ID ? (
                              <span className="form-hint">Default</span>
                            ) : (
                              <button
                                type="button"
                                className="link-delete"
                                onClick={() => {
                                  if (
                                    confirm(
                                      'Delete this place and moments pinned to it?'
                                    )
                                  )
                                    deleteDestination(d.id)
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                      <div className="inline-form">
                        <input
                          value={destNameByTrip[trip.id] ?? ''}
                          onChange={(e) =>
                            setDestNameByTrip((p) => ({
                              ...p,
                              [trip.id]: e.target.value,
                            }))
                          }
                          placeholder="New place"
                          aria-label={`New place on ${trip.name}`}
                        />
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => addDest(trip.id)}
                        >
                          Add place
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          )}
        </section>

        <section className="places-merged-panel">
          <div className="places-panel-head">
            <h2 className="places-panel-title">People</h2>
            <button
              type="button"
              className="places-edit-btn"
              aria-pressed={peopleEdit}
              aria-label={peopleEdit ? 'Done editing people' : 'Edit people'}
              title={peopleEdit ? 'Done' : 'Edit'}
              onClick={() => setPeopleEdit((v) => !v)}
            >
              <IconPencil className="places-edit-icon" />
            </button>
          </div>

          {!peopleEdit ? (
            state.friends.length > 0 ? (
              <ul className="places-friend-view">
                {state.friends.map((f) => (
                  <li key={f.id}>
                    <Link
                      to={`/friends/${encodeURIComponent(f.id)}`}
                      className="places-friend-view-link"
                      style={friendChipStyle(f)}
                    >
                      {f.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null
          ) : (
            <div className="places-edit-body">
              <form
                className="inline-form trips-friend-add"
                onSubmit={addFriendSubmit}
              >
                <input
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  placeholder="Name"
                  aria-label="New friend name"
                />
                <input
                  type="color"
                  className="trips-friend-color"
                  value={friendColorDraft || '#888888'}
                  onChange={(e) => setFriendColorDraft(e.target.value)}
                  title="Accent"
                  aria-label="Friend accent"
                />
                <button type="submit" className="btn-primary">
                  Add
                </button>
              </form>
              {state.friends.length > 0 ? (
                <ul className="places-friend-chips">
                  {state.friends.map((f) => (
                    <li key={f.id}>
                      <input
                        type="color"
                        className="trips-friend-color"
                        value={
                          f.color && parseHex(f.color) ? f.color : '#888888'
                        }
                        title="Accent"
                        aria-label={`Color for ${f.name}`}
                        onChange={(e) =>
                          updateFriend({ ...f, color: e.target.value })
                        }
                      />
                      <Link
                        to={`/friends/${encodeURIComponent(f.id)}`}
                        className="trips-friends-quick-link"
                        style={friendChipStyle(f)}
                      >
                        {f.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
