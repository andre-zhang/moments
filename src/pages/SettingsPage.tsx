import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import type { SelectionList, TagCategory } from '../types'
import { parseHex } from '../lib/colorAccent'
import { tagChipStyle } from '../lib/chipStyles'
import { DEFAULT_TAG_CATEGORIES } from '../whimsy/tagLibrary'
import { DEFAULT_SELECTION_LISTS } from '../whimsy/selectionLists'
import { useTravel } from '../store/travelStore'

function cloneCategories(src: TagCategory[]): TagCategory[] {
  return src.map((c) => ({
    ...c,
    tags: [...c.tags],
    tagColors: { ...(c.tagColors ?? {}) },
    ...(c.appliesToKinds ? { appliesToKinds: [...c.appliesToKinds] } : {}),
  }))
}

function cloneSelectionLists(src: SelectionList[]): SelectionList[] {
  return src.map((l) => ({
    ...l,
    options: [...l.options],
    optionColors: { ...(l.optionColors ?? {}) },
    appliesToKinds: [...l.appliesToKinds],
  }))
}

export function SettingsPage() {
  const {
    state,
    setTagCategories,
    setSelectionLists,
    setUiSoundEnabled,
    resetToDemo,
  } = useTravel()
  const [cats, setCats] = useState<TagCategory[]>(() =>
    cloneCategories(state.tagCategories)
  )
  const [lists, setLists] = useState<SelectionList[]>(() =>
    cloneSelectionLists(state.selectionLists)
  )

  const syncFromStore = () => {
    setCats(cloneCategories(state.tagCategories))
    setLists(cloneSelectionLists(state.selectionLists))
  }

  const updateLabel = (id: string, label: string) => {
    setCats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, label } : c))
    )
  }

  const addTag = (id: string, tag: string) => {
    const t = tag.trim()
    if (!t) return
    setCats((prev) =>
      prev.map((c) =>
        c.id === id && !c.tags.includes(t)
          ? { ...c, tags: [...c.tags, t] }
          : c
      )
    )
  }

  const removeTag = (id: string, tag: string) => {
    setCats((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const nextColors = { ...(c.tagColors ?? {}) }
        delete nextColors[tag]
        return {
          ...c,
          tags: c.tags.filter((x) => x !== tag),
          tagColors: nextColors,
        }
      })
    )
  }

  const setTagColor = (id: string, tag: string, hex: string | null) => {
    setCats((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const next = { ...(c.tagColors ?? {}) }
        if (hex == null || hex === '') delete next[tag]
        else next[tag] = hex
        return { ...c, tagColors: next }
      })
    )
  }

  const resetCategory = (id: string) => {
    const d = DEFAULT_TAG_CATEGORIES.find((c) => c.id === id)
    if (!d) return
    setCats((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...d,
              tags: [...d.tags],
              tagColors: { ...(d.tagColors ?? {}) },
              ...(d.appliesToKinds
                ? { appliesToKinds: [...d.appliesToKinds] }
                : {}),
            }
          : c
      )
    )
  }

  const save = () => {
    setTagCategories(cloneCategories(cats))
    alert('Tags saved.')
  }

  const addListOption = (listId: string, opt: string) => {
    const t = opt.trim()
    if (!t) return
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId && !l.options.includes(t)
          ? { ...l, options: [...l.options, t] }
          : l
      )
    )
  }

  const removeListOption = (listId: string, opt: string) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              options: l.options.filter((x) => x !== opt),
              optionColors: Object.fromEntries(
                Object.entries(l.optionColors ?? {}).filter(([k]) => k !== opt)
              ),
            }
          : l
      )
    )
  }

  const updateListLabel = (listId: string, label: string) => {
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, label } : l))
    )
  }

  const resetListDefaults = (listId: string) => {
    const d = DEFAULT_SELECTION_LISTS.find((x) => x.id === listId)
    if (!d) return
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...d,
              options: [...d.options],
              optionColors: { ...(d.optionColors ?? {}) },
              appliesToKinds: [...d.appliesToKinds],
            }
          : l
      )
    )
  }

  const saveLists = () => {
    setSelectionLists(cloneSelectionLists(lists))
    alert('Choice lists saved.')
  }

  return (
    <div className="page settings-page">
      <PageHeader title="Settings" />

      <section className="panel-block">
        <h2 className="panel-block-title">Demo data</h2>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            if (
              confirm(
                'Load demo data? This replaces your current journal, trips, and photos stored here.'
              )
            )
              void resetToDemo()
          }}
        >
          Load demo trips &amp; moments
        </button>
      </section>

      <section className="panel-block">
        <h2 className="panel-block-title">Sound</h2>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={state.uiSoundEnabled}
            onChange={(e) => setUiSoundEnabled(e.target.checked)}
          />
          <span>Sound on save</span>
        </label>
      </section>

      <section className="panel-block" id="tag-library">
        <h2 className="panel-block-title">Free-form tags</h2>
        <div className="settings-head-actions">
          <button type="button" className="btn-secondary" onClick={syncFromStore}>
            Reload tag draft
          </button>
        </div>

        <div className="settings-cats">
        {cats.map((cat) => (
          <section key={cat.id} className="settings-cat">
            <div className="settings-cat-head">
              <label>
                Category label
                <input
                  value={cat.label}
                  onChange={(e) => updateLabel(cat.id, e.target.value)}
                />
              </label>
              <button
                type="button"
                className="btn-secondary btn-small"
                onClick={() => resetCategory(cat.id)}
              >
                Reset defaults
              </button>
            </div>
            <TagEditor
              category={cat}
              onAdd={(tag) => addTag(cat.id, tag)}
              onRemove={(tag) => removeTag(cat.id, tag)}
              onSetColor={(tag, hex) => setTagColor(cat.id, tag, hex)}
            />
          </section>
        ))}
        </div>

        <button type="button" className="btn-primary settings-save-tags" onClick={save}>
          Save tags
        </button>
      </section>

      <section className="panel-block" id="choice-lists">
        <h2 className="panel-block-title">Choice lists</h2>
        <p className="form-hint settings-tag-intro">
          Single choice per list on moments (same save as tags).
        </p>
        <div className="settings-cats">
          {lists.map((list) => (
            <section key={list.id} className="settings-cat">
              <div className="settings-cat-head">
                <label>
                  List label
                  <input
                    value={list.label}
                    onChange={(e) => updateListLabel(list.id, e.target.value)}
                  />
                </label>
                {DEFAULT_SELECTION_LISTS.some((d) => d.id === list.id) ? (
                  <button
                    type="button"
                    className="btn-secondary btn-small"
                    onClick={() => resetListDefaults(list.id)}
                  >
                    Reset options
                  </button>
                ) : null}
              </div>
              <ListOptionEditor
                listId={list.id}
                options={list.options}
                onAdd={(o) => addListOption(list.id, o)}
                onRemove={(o) => removeListOption(list.id, o)}
              />
            </section>
          ))}
        </div>
        <button type="button" className="btn-primary" onClick={saveLists}>
          Save choice lists
        </button>
      </section>
    </div>
  )
}

function ListOptionEditor({
  listId,
  options,
  onAdd,
  onRemove,
}: {
  listId: string
  options: string[]
  onAdd: (o: string) => void
  onRemove: (o: string) => void
}) {
  const [draft, setDraft] = useState('')
  return (
    <div className="tag-editor">
      <div className="tag-editor-row">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="New option"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAdd(draft)
              setDraft('')
            }
          }}
        />
        <button
          type="button"
          className="btn-secondary btn-small"
          onClick={() => {
            onAdd(draft)
            setDraft('')
          }}
        >
          Add
        </button>
      </div>
      <ul className="tag-editor-list">
        {options.map((opt) => (
          <li key={`${listId}-${opt}`}>
            <span>{opt}</span>
            <button
              type="button"
              className="tag-editor-remove"
              onClick={() => onRemove(opt)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TagEditor({
  category,
  onAdd,
  onRemove,
  onSetColor,
}: {
  category: TagCategory
  onAdd: (tag: string) => void
  onRemove: (tag: string) => void
  onSetColor: (tag: string, hex: string | null) => void
}) {
  const [draft, setDraft] = useState('')
  return (
    <div className="tag-editor">
      <div className="tag-editor-row">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="New tag"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAdd(draft)
              setDraft('')
            }
          }}
        />
        <button
          type="button"
          className="btn-secondary btn-small"
          onClick={() => {
            onAdd(draft)
            setDraft('')
          }}
        >
          Add
        </button>
      </div>
      <ul className="tag-editor-list">
        {category.tags.map((tag) => {
          const stored = category.tagColors?.[tag]
          const valid = stored && parseHex(stored) ? stored : null
          const inputValue = valid ?? '#888888'
          return (
            <li key={`${category.id}-${tag}`}>
              <span
                className="memory-tag"
                style={tagChipStyle(category, tag)}
              >
                {tag}
              </span>
              <input
                type="color"
                className="tag-editor-color"
                value={inputValue}
                title="Tag color"
                aria-label={`Color for ${tag}`}
                onChange={(e) => onSetColor(tag, e.target.value)}
              />
              {valid ? (
                <button
                  type="button"
                  className="tag-editor-color-clear"
                  onClick={() => onSetColor(tag, null)}
                >
                  Clear
                </button>
              ) : null}
              <button
                type="button"
                className="tag-editor-remove"
                onClick={() => onRemove(tag)}
              >
                ×
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
