import type { CSSProperties } from 'react'
import type { Friend, SelectionList, TagCategory } from '../types'
import {
  fallbackFriendColor,
  fallbackTagBg,
  parseHex,
  readableOnHex,
} from './colorAccent'

function normHex(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  const withHash = t.startsWith('#') ? t : `#${t}`
  return parseHex(withHash) ? withHash : null
}

export function tagChipStyle(cat: TagCategory, tag: string): CSSProperties {
  const hex = cat.tagColors?.[tag] ? normHex(cat.tagColors[tag]) : null
  if (hex) {
    return {
      backgroundColor: hex,
      color: readableOnHex(hex),
      borderColor: `${hex}99`,
    }
  }
  const bg = fallbackTagBg(`${cat.id}:${tag}`)
  return {
    backgroundColor: bg,
    color: '#1a1a1a',
    borderColor: 'var(--line)',
  }
}

/** Style chips for a choice-list option (mirrors tag colors). */
export function selectionListOptionStyle(
  list: SelectionList,
  option: string
): CSSProperties {
  const hex = list.optionColors?.[option] ? normHex(list.optionColors[option]) : null
  if (hex) {
    return {
      backgroundColor: hex,
      color: readableOnHex(hex),
      borderColor: `${hex}99`,
    }
  }
  const bg = fallbackTagBg(`${list.id}:${option}`)
  return {
    backgroundColor: bg,
    color: '#1a1a1a',
    borderColor: 'var(--line)',
  }
}

export function friendChipStyle(f: Friend): CSSProperties {
  const hex = f.color ? normHex(f.color) : null
  if (hex) {
    return {
      backgroundColor: `${hex}22`,
      color: hex,
      borderColor: `${hex}66`,
    }
  }
  const c = fallbackFriendColor(f.name)
  return {
    backgroundColor: 'var(--panel-muted)',
    color: c,
    borderColor: c,
    borderWidth: '1.5px',
  }
}
