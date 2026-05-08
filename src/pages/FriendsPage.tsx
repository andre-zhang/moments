import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { getPageDemoBanner } from '../lib/demoSamplePhotos'
import { parseHex } from '../lib/colorAccent'
import { friendChipStyle } from '../lib/chipStyles'
import { useTravel } from '../store/travelStore'

export function FriendsPage() {
  const { state, addFriend, updateFriend, removeFriend } = useTravel()
  const [name, setName] = useState('')
  const [newColor, setNewColor] = useState('')

  const friendsBanner = useMemo(() => getPageDemoBanner('friends-hero'), [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = name.trim()
    if (!n) return
    const hex = newColor && parseHex(newColor) ? newColor : undefined
    addFriend({
      id: `f-${crypto.randomUUID()}`,
      name: n,
      ...(hex ? { color: hex } : {}),
    })
    setName('')
    setNewColor('')
  }

  return (
    <div className="page friends-page">
      <PageHeader
        title="Friends"
        banner={{
          src: friendsBanner.src,
          caption: friendsBanner.caption,
          alt: friendsBanner.alt,
        }}
      />

      <section className="panel-block">
        <h2 className="panel-block-title">Add</h2>
        <form className="friend-add-form" onSubmit={submit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <label className="friend-add-color-label">
          <span className="form-hint">Accent (optional)</span>
          <input
            type="color"
            className="friend-list-swatch"
            value={newColor || '#888888'}
            onChange={(e) => setNewColor(e.target.value)}
            aria-label="Accent color for new friend"
          />
        </label>
        <button type="submit" className="btn-primary">
          Save
        </button>
        </form>
      </section>

      {state.friends.length === 0 ? (
        <p className="form-hint">No friends yet. Add a few names above.</p>
      ) : (
        <ul className="friend-list">
          {state.friends.map((f) => {
            const hasHex = Boolean(f.color && parseHex(f.color))
            return (
              <li key={f.id} className="friend-list-row">
                <input
                  type="color"
                  className="friend-list-swatch"
                  value={hasHex ? f.color! : '#888888'}
                  title="Friend accent"
                  aria-label={`Color for ${f.name}`}
                  onChange={(e) =>
                    updateFriend({ ...f, color: e.target.value })
                  }
                />
                <Link
                  to={`/friends/${encodeURIComponent(f.id)}`}
                  className="friend-pill friend-pill--link"
                  style={friendChipStyle(f)}
                >
                  {f.name}
                </Link>
                {hasHex ? (
                  <button
                    type="button"
                    className="tag-editor-color-clear"
                    onClick={() => updateFriend({ ...f, color: undefined })}
                  >
                    Clear color
                  </button>
                ) : null}
                <button
                  type="button"
                  className="link-delete"
                  onClick={() => {
                    if (confirm(`Remove ${f.name} from your list and all moments?`))
                      removeFriend(f.id)
                  }}
                >
                  Remove
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
