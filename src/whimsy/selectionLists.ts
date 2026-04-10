import type { MemoryKind, SelectionList } from '../types'

export const DEFAULT_SELECTION_LISTS: SelectionList[] = [
  {
    id: 'cuisine',
    label: 'Cuisine',
    appliesToKinds: ['restaurant'],
    options: [
      'French',
      'Italian',
      'Japanese',
      'Chinese',
      'Korean',
      'Mexican',
      'Indian',
      'Thai',
      'American',
      'Middle Eastern',
      'Spanish',
      'Vietnamese',
      'Other',
    ],
    optionColors: {},
  },
]

export function cloneDefaultSelectionLists(): SelectionList[] {
  return DEFAULT_SELECTION_LISTS.map((l) => ({
    ...l,
    options: [...l.options],
    optionColors: { ...(l.optionColors ?? {}) },
  }))
}

export function selectionListAppliesTo(
  list: SelectionList,
  kind: MemoryKind
): boolean {
  return list.appliesToKinds.includes(kind)
}
