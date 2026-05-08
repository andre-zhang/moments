import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { PhotoStrip } from '../components/PhotoStrip'
import { SelectWithPlus } from '../components/SelectWithPlus'
import { IconDots, IconPencil, IconTrash } from '../components/Icons'
import { getPageDemoBanner } from '../lib/demoSamplePhotos'
import {
  friendChipStyle,
  selectionListOptionStyle,
  tagChipStyle,
} from '../lib/chipStyles'
import { KIND_EMOJI, KIND_LABEL } from '../lib/kindMeta'
import { sortTripsForDisplay, TRIPLESS_TRIP_ID } from '../lib/tripless'
import type { Memory, MemoryKind, TagCategory } from '../types'
import { useTravel } from '../store/travelStore'

type JournalSort = 'date-desc' | 'date-asc' | 'type' | 'rating'

const KIND_ORDER: MemoryKind[] = [
  'flight',
  'hotel',
  'restaurant',
  'sight',
  'note',
]

function kindOrderIndex(k: MemoryKind): number {
  const i = KIND_ORDER.indexOf(k)
  return i >= 0 ? i : 99
}

const MAX_JOURNAL_CATEGORY_TAGS = 5

function categoryTagPicks(m: Memory, categories: TagCategory[]) {
  const out: { catId: string; tag: string }[] = []
  for (const cat of categories) {
    const picked = m.categoryTags?.[cat.id]
    if (!picked?.length) continue
    for (const tag of picked) out.push({ catId: cat.id, tag })
  }
  return out
}

function momentRating(m: Memory): number | null {
  if (m.kind === 'restaurant' && m.restaurantDetails?.rating != null)
    return m.restaurantDetails.rating
  if (m.kind === 'hotel' && m.hotelDetails?.stars != null)
    return m.hotelDetails.stars
  return null
}

export function JournalPage() {
  const { state, selectTrip, deleteMemory } = useTravel()
  const {
    memories,
    trips,
    destinations,
    selectedTripId,
    friends,
    selectionLists,
    tagCategories,
  } = state
  const [sort, setSort] = useState<JournalSort>('date-desc')

  const tripsSorted = useMemo(() => sortTripsForDisplay(trips), [trips])

  const tripName = (id: string) => trips.find((t) => t.id === id)?.name ?? id
  const destName = (id: string) =>
    destinations.find((d) => d.id === id)?.name ?? 'Place'
  const friendName = (id: string) =>
    friends.find((f) => f.id === id)?.name ?? id

  const filtered = useMemo(() => {
    let list = memories
    if (selectedTripId)
      list = list.filter((m) => m.tripId === selectedTripId)
    const copy = [...list]
    const byDateDesc = (a: Memory, b: Memory) =>
      Date.parse(b.visitedAt) - Date.parse(a.visitedAt)
    const byDateAsc = (a: Memory, b: Memory) =>
      Date.parse(a.visitedAt) - Date.parse(b.visitedAt)
    switch (sort) {
      case 'date-desc':
        copy.sort(byDateDesc)
        break
      case 'date-asc':
        copy.sort(byDateAsc)
        break
      case 'type':
        copy.sort((a, b) => {
          const kd = kindOrderIndex(a.kind) - kindOrderIndex(b.kind)
          if (kd !== 0) return kd
          return byDateDesc(a, b)
        })
        break
      case 'rating':
        copy.sort((a, b) => {
          const ra = momentRating(a)
          const rb = momentRating(b)
          if (ra != null && rb != null && ra !== rb) return rb - ra
          if (ra != null && rb == null) return -1
          if (ra == null && rb != null) return 1
          return byDateDesc(a, b)
        })
        break
      default:
        copy.sort(byDateDesc)
    }
    return copy
  }, [memories, selectedTripId, sort])

  const thisTimeLastYear = useMemo(() => {
    const now = new Date()
    return filtered.filter((m) => {
      const d = new Date(m.visitedAt)
      return (
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate() &&
        d.getFullYear() !== now.getFullYear()
      )
    })
  }, [filtered])

  const journalEmptyBanner = useMemo(
    () => getPageDemoBanner('journal-empty'),
    []
  )

  const surprise = () => {
    if (filtered.length === 0) return
    const m = filtered[Math.floor(Math.random() * filtered.length)]
    document
      .getElementById(`memory-${m.id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="page journal-page">
      <PageHeader
        className="page-header-shell--journal"
        title="Journal"
        toolbarBelow
        actions={
          <div className="journal-toolbar">
            <SelectWithPlus>
              <select
                value={selectedTripId ?? ''}
                onChange={(e) =>
                  selectTrip(e.target.value ? e.target.value : null)
                }
                aria-label="Filter by trip"
              >
                <option value="">All trips</option>
                {tripsSorted.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </SelectWithPlus>
            <div className="journal-toolbar-sort">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as JournalSort)}
                aria-label="Sort moments"
              >
                <option value="date-desc">Newest first</option>
                <option value="date-asc">Oldest first</option>
                <option value="type">Type</option>
                <option value="rating">Rating (restaurant / hotel stars)</option>
              </select>
            </div>
            {selectedTripId && selectedTripId !== TRIPLESS_TRIP_ID ? (
              <Link
                className="btn-secondary journal-replay-trip"
                to={`/storybook?trip=${encodeURIComponent(selectedTripId)}&replay=1`}
              >
                Replay this trip
              </Link>
            ) : null}
          </div>
        }
      />

      <details className="journal-spoiler">
        <summary>On this date, other years</summary>
        <div className="journal-spoiler-body">
          <div className="journal-spoiler-actions">
            <button type="button" className="btn-secondary" onClick={surprise}>
              Pick one
            </button>
          </div>
          {thisTimeLastYear.length > 0 ? (
            <div className="time-machine">
              <h3 className="time-machine-title">Other years, today’s date</h3>
              <ul className="time-machine-list">
                {thisTimeLastYear.slice(0, 6).map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      className="time-machine-link"
                      onClick={() =>
                        document
                          .getElementById(`memory-${m.id}`)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                    >
                      <strong>{m.title}</strong>
                      <span>
                        {new Date(m.visitedAt).getFullYear()} ·{' '}
                        {destName(m.destinationId)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="form-hint whimsy-empty">None yet.</p>
          )}
        </div>
      </details>

      {filtered.length === 0 ? (
        <section
          className="journal-empty-banner"
          aria-labelledby="journal-empty-title"
        >
          <div
            className="journal-empty-banner__bg"
            style={{ backgroundImage: `url(${journalEmptyBanner.src})` }}
            aria-hidden
          />
          <div className="journal-empty-banner__scrim" aria-hidden />
          <div className="journal-empty-banner__content">
            <p id="journal-empty-title" className="journal-empty-banner__title">
              Nothing in this view
            </p>
            <p className="journal-empty-banner__text">
              {trips.length === 0
                ? 'Open Places & people to add trips and places, then add a moment from +.'
                : 'Add a moment or clear the trip filter.'}
            </p>
          </div>
          <p className="journal-empty-banner__caption">{journalEmptyBanner.caption}</p>
        </section>
      ) : (
        <ul className="memory-list">
          {filtered.map((m) => (
            <li key={m.id} id={`memory-${m.id}`} className="memory-card">
              <div className="memory-card-layout">
                <Link
                  to={`/moment/${encodeURIComponent(m.id)}?from=journal`}
                  className="memory-card-hit"
                >
                  <div className="memory-card-visual">
                    <span className="memory-kind" title={KIND_LABEL[m.kind]}>
                      {m.pinEmoji?.trim() || KIND_EMOJI[m.kind]}
                    </span>
                    <PhotoStrip
                      memoryId={m.id}
                      max={1}
                      className="photo-strip--journal-thumb"
                    />
                  </div>
                  <div className="memory-card-body">
                    <h2 className="memory-card-title">{m.title}</h2>
                    <p className="memory-meta">
                      {destName(m.destinationId)} · {tripName(m.tripId)}
                    </p>
                    <p className="memory-date">
                      {new Date(m.visitedAt).toLocaleDateString(undefined, {
                        dateStyle: 'medium',
                      })}
                    </p>
                    {m.placeLabel ? (
                      <p className="memory-place">{m.placeLabel}</p>
                    ) : null}
                    {m.body ? <p className="memory-body">{m.body}</p> : null}
                    {m.categoryTags &&
                    Object.values(m.categoryTags).some((a) => a?.length) ? (
                      <div className="memory-tags">
                        {(() => {
                          const picks = categoryTagPicks(m, tagCategories)
                          const shown = picks.slice(0, MAX_JOURNAL_CATEGORY_TAGS)
                          const more = picks.length - shown.length
                          return (
                            <>
                              {shown.map(({ catId, tag }) => {
                                const cat = tagCategories.find((c) => c.id === catId)
                                if (!cat) return null
                                return (
                                  <span
                                    key={`${catId}-${tag}`}
                                    className="memory-tag"
                                    style={tagChipStyle(cat, tag)}
                                  >
                                    {tag}
                                  </span>
                                )
                              })}
                              {more > 0 ? (
                                <span
                                  className="memory-tag memory-tag--overflow"
                                  title={`${more} more tag${more === 1 ? '' : 's'} — open moment to see all`}
                                >
                                  +{more}
                                </span>
                              ) : null}
                            </>
                          )
                        })()}
                      </div>
                    ) : null}
                    {selectionLists.some(
                      (list) =>
                        list.appliesToKinds.includes(m.kind) &&
                        m.selectionListValues?.[list.id]
                    ) ? (
                      <div className="memory-tags memory-tags--choice">
                        {selectionLists.map((list) => {
                          if (!list.appliesToKinds.includes(m.kind)) return null
                          const v = m.selectionListValues?.[list.id]
                          if (!v) return null
                          return (
                            <span
                              key={list.id}
                              className="memory-tag"
                              style={selectionListOptionStyle(list, v)}
                              title={list.label}
                            >
                              {v}
                            </span>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                </Link>
                {m.friendIds?.length ? (
                  <div className="memory-card-friends-slot">
                    <p className="memory-friends">
                      With{' '}
                      {m.friendIds.map((id) => {
                        const fr = friends.find((x) => x.id === id)
                        const stub = fr ?? { id, name: friendName(id) }
                        return (
                          <Link
                            key={id}
                            to={`/friends/${encodeURIComponent(id)}`}
                            className="friend-pill friend-pill--link"
                            style={friendChipStyle(stub)}
                          >
                            {friendName(id)}
                          </Link>
                        )
                      })}
                    </p>
                  </div>
                ) : null}
                <div className="memory-card-actions">
                  <details className="details-menu">
                    <summary
                      className="details-menu-trigger details-menu-trigger--icon"
                      aria-label="Moment actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconDots className="btn-icon-svg" />
                    </summary>
                    <div className="details-menu-panel">
                      <Link
                        to={`/add/moment?edit=${encodeURIComponent(m.id)}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconPencil className="btn-icon-svg" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="details-menu-danger"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Delete this moment and its photos?'))
                            deleteMemory(m.id)
                        }}
                      >
                        <IconTrash className="btn-icon-svg" />
                        Delete
                      </button>
                    </div>
                  </details>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
