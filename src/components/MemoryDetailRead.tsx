import { Link } from 'react-router-dom'
import { aircraftLabel, cabinLabel } from '../data/aircraftTypes'
import type { Friend, Memory, TagCategory } from '../types'
import { friendChipStyle, tagChipStyle } from '../lib/chipStyles'
import { formatDurationMinutes } from '../lib/flightDuration'
import { KIND_EMOJI, KIND_LABEL } from '../lib/kindMeta'
import { IconDots, IconMapPin, IconPencil, IconTrash } from './Icons'
import { PhotoStrip } from './PhotoStrip'

function KindExtras({ memory }: { memory: Memory }) {
  if (memory.kind === 'flight' && memory.flightDetails) {
    const f = memory.flightDetails
    const ac = aircraftLabel(f.aircraftType)
    const cab = cabinLabel(f.cabinClass)
    const dur = formatDurationMinutes(f.durationMinutes)
    const chips: { k: string; v: string }[] = []
    if (ac) chips.push({ k: 'Aircraft', v: ac })
    if (cab) chips.push({ k: 'Class', v: cab })
    if (dur) chips.push({ k: 'Time', v: dur })
    if (f.distanceKm != null && f.distanceKm > 0)
      chips.push({ k: 'Distance', v: `${f.distanceKm.toLocaleString()} km` })
    if (f.confirmationCode)
      chips.push({ k: 'PNR', v: f.confirmationCode })
    const hasRoute = Boolean(f.fromCode && f.toCode)
    if (!f.airline && !hasRoute && chips.length === 0) return null
    return (
      <div className="flight-detail-card">
        {f.airline ? (
          <p className="flight-detail-airline">{f.airline}</p>
        ) : null}
        {hasRoute ? (
          <div className="flight-detail-route" aria-label="Route">
            <span className="flight-iata">{f.fromCode}</span>
            <span className="flight-route-arrow" aria-hidden>
              →
            </span>
            <span className="flight-iata">{f.toCode}</span>
          </div>
        ) : null}
        {chips.length > 0 ? (
          <ul className="flight-detail-chips">
            {chips.map((c) => (
              <li key={c.k} className="flight-detail-chip">
                <strong>{c.k}</strong>
                {c.v}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  }
  if (memory.kind === 'hotel' && memory.hotelDetails) {
    const h = memory.hotelDetails
    const rows: { k: string; v: string }[] = []
    if (h.brand) rows.push({ k: 'Brand', v: h.brand })
    if (h.checkIn) rows.push({ k: 'Check-in', v: h.checkIn })
    if (h.checkOut) rows.push({ k: 'Check-out', v: h.checkOut })
    if (h.nights != null && h.nights > 0)
      rows.push({ k: 'Nights', v: String(h.nights) })
    if (h.stars != null && h.stars >= 1)
      rows.push({ k: 'Stars', v: String(h.stars) })
    if (h.roomType) rows.push({ k: 'Room', v: h.roomType })
    if (rows.length === 0) return null
    return (
      <dl className="memory-kind-dl">
        {rows.map((r) => (
          <div key={r.k} className="memory-kind-dl-row">
            <dt>{r.k}</dt>
            <dd>{r.v}</dd>
          </div>
        ))}
      </dl>
    )
  }
  if (memory.kind === 'restaurant' && memory.restaurantDetails) {
    const r = memory.restaurantDetails
    const rows: { k: string; v: string }[] = []
    if (r.venueStyle) rows.push({ k: 'Style', v: r.venueStyle })
    if (r.cuisine) rows.push({ k: 'Cuisine', v: r.cuisine })
    if (r.rating != null) rows.push({ k: 'Rating', v: `${r.rating}/5` })
    if (r.wouldEatAgain === true) rows.push({ k: 'Again?', v: 'Yes' })
    if (r.wouldEatAgain === false) rows.push({ k: 'Again?', v: 'No' })
    if (rows.length === 0) return null
    return (
      <dl className="memory-kind-dl">
        {rows.map((x) => (
          <div key={x.k} className="memory-kind-dl-row">
            <dt>{x.k}</dt>
            <dd>{x.v}</dd>
          </div>
        ))}
      </dl>
    )
  }
  if (memory.kind === 'sight' && memory.sightDetails) {
    const s = memory.sightDetails
    if (!s.venueType && !s.highlights?.trim()) return null
    return (
      <dl className="memory-kind-dl">
        {s.venueType ? (
          <div className="memory-kind-dl-row">
            <dt>Type</dt>
            <dd>{s.venueType}</dd>
          </div>
        ) : null}
        {s.highlights?.trim() ? (
          <div className="memory-kind-dl-row">
            <dt>Highlights</dt>
            <dd>{s.highlights.trim()}</dd>
          </div>
        ) : null}
      </dl>
    )
  }
  if (memory.kind === 'note' && memory.noteDetails?.topic) {
    return (
      <dl className="memory-kind-dl">
        <div className="memory-kind-dl-row">
          <dt>Topic</dt>
          <dd>{memory.noteDetails.topic}</dd>
        </div>
      </dl>
    )
  }
  return null
}

export function MemoryDetailRead({
  memory,
  tagCategories,
  friends,
  tripName,
  destName,
  tripId,
  showMapLink = false,
  onDelete,
  variant = 'default',
}: {
  memory: Memory
  tagCategories: TagCategory[]
  friends: Friend[]
  tripName: string
  destName: string
  tripId?: string
  showMapLink?: boolean
  onDelete: () => void
  /** Passport stamp book moment spread — typography & “official” marks */
  variant?: 'default' | 'passport-stamp'
}) {
  const friendName = (id: string) =>
    friends.find((f) => f.id === id)?.name ?? id

  const tripHref =
    tripId != null
      ? `/places?trip=${encodeURIComponent(tripId)}`
      : undefined

  const editHref = `/add/moment?edit=${encodeURIComponent(memory.id)}`
  const stamp = variant === 'passport-stamp'
  const kindGlyph = memory.pinEmoji?.trim() || KIND_EMOJI[memory.kind]

  return (
    <div className={`memory-detail-read${stamp ? ' memory-detail-read--passport-stamp' : ''}`}>
      <div className="memory-detail-read-head">
        {stamp ? (
          <div className="memory-kind-seal">
            <span className="memory-kind-seal__ring" aria-hidden>
              <span className="memory-kind-seal__glyph">{kindGlyph}</span>
            </span>
            <span className="memory-kind-seal__label">{KIND_LABEL[memory.kind]}</span>
          </div>
        ) : (
          <span className="memory-kind-lg" title={KIND_LABEL[memory.kind]}>
            {kindGlyph}
          </span>
        )}
        <div>
          <h2 className="memory-detail-title">{memory.title}</h2>
          <p
            className={`memory-detail-meta${stamp ? ' memory-detail-meta--passport-line' : ''}`}
          >
            {KIND_LABEL[memory.kind]} · {destName}
            {tripHref ? (
              <>
                {' · '}
                <Link to={tripHref} className="memory-detail-trip-link">
                  {tripName}
                </Link>
              </>
            ) : (
              <> · {tripName}</>
            )}
          </p>
          <p className="memory-detail-meta">
            {new Date(memory.visitedAt).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
          {memory.placeLabel ? (
            <p className="memory-detail-place">{memory.placeLabel}</p>
          ) : null}
        </div>
      </div>

      <KindExtras memory={memory} />

      <PhotoStrip memoryId={memory.id} />
      {memory.body ? <p className="memory-detail-body">{memory.body}</p> : null}
      {memory.categoryTags &&
      Object.values(memory.categoryTags).some((a) => a?.length) ? (
        <div className="memory-tags">
          {stamp ? (
            <p className="memory-tags-passport-heading">Official marks</p>
          ) : null}
          {tagCategories.map((cat) => {
            const picked = memory.categoryTags?.[cat.id]
            if (!picked?.length) return null
            return picked.map((tag) => (
              <span
                key={`${cat.id}-${tag}`}
                className={`memory-tag${stamp ? ' memory-tag--passport' : ''}`}
                style={stamp ? undefined : tagChipStyle(cat, tag)}
              >
                {tag}
              </span>
            ))
          })}
        </div>
      ) : null}
      {memory.friendIds?.length ? (
        <p className={`memory-friends${stamp ? ' memory-friends--passport' : ''}`}>
          {stamp ? (
            <span className="memory-friends-passport-label">Travelers · </span>
          ) : (
            <>With </>
          )}
          {memory.friendIds.map((id) => {
            const fr = friends.find((x) => x.id === id)
            const stub = fr ?? { id, name: friendName(id) }
            return (
              <Link
                key={id}
                to={`/friends/${encodeURIComponent(id)}`}
                className={`friend-pill friend-pill--link${stamp ? ' friend-pill--passport' : ''}`}
                style={friendChipStyle(stub)}
              >
                {friendName(id)}
              </Link>
            )
          })}
        </p>
      ) : null}
      <div className="memory-detail-actions">
        <Link to={editHref} className="btn-primary btn-with-icon" title="Edit">
          <IconPencil className="btn-icon-svg" />
          <span>Edit</span>
        </Link>
        <details className="details-menu">
          <summary className="details-menu-trigger">
            <IconDots className="btn-icon-svg" />
            <span>More</span>
          </summary>
          <div className="details-menu-panel">
            {showMapLink ? (
              <Link to="/map">
                <IconMapPin className="btn-icon-svg" />
                Map
              </Link>
            ) : null}
            <button
              type="button"
              className="details-menu-danger"
              onClick={() => {
                if (confirm('Delete this moment and its photos?')) onDelete()
              }}
            >
              <IconTrash className="btn-icon-svg" />
              Delete
            </button>
          </div>
        </details>
      </div>
    </div>
  )
}
