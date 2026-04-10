import type { SelectionList } from '../types'
import { selectionListOptionStyle } from '../lib/chipStyles'

export function SelectionChipPicker({
  list,
  value,
  onChange,
}: {
  list: SelectionList
  value: string
  onChange: (next: string) => void
}) {
  return (
    <div className="tag-picker">
      <span className="tag-picker-label">{list.label}</span>
      <div className="tag-chip-row">
        {list.options.map((opt) => {
          const active = value === opt
          return (
            <button
              key={opt}
              type="button"
              className={`tag-chip${active ? ' tag-chip--on' : ''}`}
              style={selectionListOptionStyle(list, opt)}
              onClick={() => onChange(active ? '' : opt)}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
