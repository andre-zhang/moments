import { Link, useNavigate } from 'react-router-dom'
import { IconDots, IconPencil, IconTrash } from './Icons'
import {
  friendChipStyle,
  selectionListOptionStyle,
  tagChipStyle,
} from '../lib/chipStyles'
import { KIND_EMOJI, KIND_LABEL } from '../lib/kindMeta'
import type { Friend, Memory, SelectionList, TagCategory } from '../types'
import { useMemoryCoverUrl } from '../hooks/useMemoryCoverUrl'

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

type JournalMemoryCardProps = {
  memory: Memory
  deleteMemory: (id: string) => void
  destName: (id: string) => string
  tripName: (id: string) => string
  friendName: (id: string) => string
  tagCategories: TagCategory[]
  selectionLists: SelectionList[]
  friends: Friend[]
}

export function JournalMemoryCard({
  memory: m,
  deleteMemory,
  destName,
  tripName,
  friendName,
  tagCategories,
  selectionLists,
  friends,
}: JournalMemoryCardProps) {
  const navigate = useNavigate()
  const coverUrl = useMemoryCoverUrl(m.id)
  const hasCover = Boolean(coverUrl)

  return (
    <li
      id={`memory-${m.id}`}
      className={`memory-card${hasCover ? ' memory-card--with-cover' : ''}`}
      style={
        hasCover && coverUrl
          ? {
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {hasCover ? <div className="memory-card-cover-scrim" aria-hidden /> : null}
      <div className="memory-card-layout">
        <div
          className={`memory-card-hit${hasCover ? ' memory-card-hit--cover-glass' : ''}`}
          role="link"
          tabIndex={0}
          aria-label={`Open moment: ${m.title}`}
          onClick={() =>
            navigate(`/moment/${encodeURIComponent(m.id)}?from=journal`)
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              navigate(`/moment/${encodeURIComponent(m.id)}?from=journal`)
            }
          }}
        >
          <div className="memory-card-visual">
            <span className="memory-kind" title={KIND_LABEL[m.kind]}>
              {m.pinEmoji?.trim() || KIND_EMOJI[m.kind]}
            </span>
          </div>
          <div className="memory-card-body">
            <h2 className="memory-card-title">{m.title}</h2>
            <p className="memory-meta">
              <Link
                to={`/places/${encodeURIComponent(m.destinationId)}`}
                onClick={(e) => e.stopPropagation()}
              >
                {destName(m.destinationId)}
              </Link>
              {' · '}
              <Link
                to={`/places?trip=${encodeURIComponent(m.tripId)}`}
                onClick={(e) => e.stopPropagation()}
              >
                {tripName(m.tripId)}
              </Link>
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
                          title={`${more} more tag${more === 1 ? '' : 's'} (open moment for full list)`}
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
        </div>
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
          <Link
            to={`/add/moment?edit=${encodeURIComponent(m.id)}`}
            className="btn-surface-ghost btn-surface-ghost--icon"
            title="Edit moment"
            aria-label="Edit moment"
            onClick={(e) => e.stopPropagation()}
          >
            <IconPencil className="btn-icon-svg" />
          </Link>
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
  )
}
