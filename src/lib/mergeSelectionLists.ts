import type { SelectionList } from '../types'
import { cloneDefaultSelectionLists } from '../whimsy/selectionLists'

/** Merge saved lists onto defaults so built-in ids (e.g. cuisine) stay available. */
export function mergeSelectionLists(
  raw: SelectionList[] | undefined
): SelectionList[] {
  const defs = cloneDefaultSelectionLists()
  if (!raw?.length) return defs
  const map = new Map(
    defs.map((d) => [
      d.id,
      {
        ...d,
        options: [...d.options],
        optionColors: { ...(d.optionColors ?? {}) },
        appliesToKinds: [...d.appliesToKinds],
      },
    ])
  )
  for (const r of raw) {
    const existing = map.get(r.id)
    if (existing) {
      map.set(r.id, {
        ...existing,
        label: r.label?.trim() ? r.label : existing.label,
        options:
          r.options && r.options.length > 0 ? [...r.options] : [...existing.options],
        optionColors: { ...existing.optionColors, ...(r.optionColors ?? {}) },
        appliesToKinds:
          r.appliesToKinds && r.appliesToKinds.length > 0
            ? [...r.appliesToKinds]
            : [...existing.appliesToKinds],
      })
    } else {
      map.set(r.id, {
        id: r.id,
        label: r.label,
        appliesToKinds: [...(r.appliesToKinds ?? [])],
        options: [...(r.options ?? [])],
        optionColors: { ...(r.optionColors ?? {}) },
      })
    }
  }
  return [...map.values()]
}
