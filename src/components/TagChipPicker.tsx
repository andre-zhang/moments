import type { TagCategory } from '../types'
import { tagChipStyle } from '../lib/chipStyles'

const MAX_PER_CAT = 3

export function TagChipPicker({
  category,
  selected,
  onChange,
}: {
  category: TagCategory
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const toggle = (tag: string) => {
    const on = selected.includes(tag)
    if (on) {
      onChange(selected.filter((t) => t !== tag))
      return
    }
    if (selected.length >= MAX_PER_CAT) return
    onChange([...selected, tag])
  }

  return (
    <div className="tag-picker">
      <span className="tag-picker-label">{category.label}</span>
      <div className="tag-chip-row">
        {category.tags.map((tag) => {
          const active = selected.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              className={`tag-chip${active ? ' tag-chip--on' : ''}`}
              style={tagChipStyle(category, tag)}
              onClick={() => toggle(tag)}
            >
              {tag}
            </button>
          )
        })}
      </div>
    </div>
  )
}
