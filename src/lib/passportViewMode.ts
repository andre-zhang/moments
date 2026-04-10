export type PassportViewMode = 'book' | 'simple'

export const PASSPORT_VIEW_STORAGE_KEY = 'moments-passport-view'

const LEGACY_PASSPORT_VIEW_KEY = 'tripbook-passport-view'

export function readPassportViewMode(): PassportViewMode {
  try {
    let v = localStorage.getItem(PASSPORT_VIEW_STORAGE_KEY)
    if (v == null) {
      v = localStorage.getItem(LEGACY_PASSPORT_VIEW_KEY)
      if (v === 'simple' || v === 'book') {
        localStorage.setItem(PASSPORT_VIEW_STORAGE_KEY, v)
        localStorage.removeItem(LEGACY_PASSPORT_VIEW_KEY)
      }
    }
    if (v === 'simple' || v === 'book') return v
  } catch {
    /* ignore */
  }
  return 'book'
}
