import type { MemoryKind } from '../types'
import type { YearInReviewCard } from './stats'

/** Curated year-in-review lines (same `id` keys as computeYearInReview). */
export type PassportYearCardCurated = YearInReviewCard

export interface PassportAiCurations {
  /** ISO timestamp of last curate run (any section) */
  updatedAt: string
  /** Stamp id → display line under the stamp label */
  stampDetails?: Record<string, string>
  /**
   * Per-year overlays for year-in-review cards: same card `id`s as computeYearInReview;
   * merged at display time so new stats still appear when you add moments.
   */
  yearCards?: Record<number, PassportYearCardCurated[]>
  /** Moment id → one-line subtitle on passport kind lists */
  momentPassportLines?: Record<string, string>
  /** Optional one line under the kind page title */
  kindBlurbs?: Partial<Record<MemoryKind, string>>
  /** Curated order for passport kind lists (front to back) */
  kindMomentOrder?: Partial<Record<MemoryKind, string[]>>
}

/** After bulk moment deletes, stamp/year copy may be wrong; drop those until user re-runs curate. */
export function invalidatePassportStampsAndYears(
  pc: PassportAiCurations | undefined,
  removedMemoryIds: Set<string>
): PassportAiCurations | undefined {
  const pruned = prunePassportCurations(pc, removedMemoryIds)
  if (!pruned) return undefined
  return {
    ...pruned,
    stampDetails: undefined,
    yearCards: undefined,
  }
}

export function prunePassportCurations(
  pc: PassportAiCurations | undefined,
  removedMemoryIds: Set<string>
): PassportAiCurations | undefined {
  if (!pc) return undefined
  const momentPassportLines = { ...pc.momentPassportLines }
  for (const id of removedMemoryIds) {
    delete momentPassportLines[id]
  }
  const kindMomentOrder = { ...pc.kindMomentOrder } as Partial<
    Record<MemoryKind, string[]>
  >
  for (const k of Object.keys(kindMomentOrder) as MemoryKind[]) {
    const arr = kindMomentOrder[k]
    if (arr)
      kindMomentOrder[k] = arr.filter((id) => !removedMemoryIds.has(id))
  }
  return {
    ...pc,
    momentPassportLines:
      Object.keys(momentPassportLines).length > 0
        ? momentPassportLines
        : undefined,
    kindMomentOrder:
      Object.keys(kindMomentOrder).length > 0 ? kindMomentOrder : undefined,
  }
}

export function mergeYearInReviewCurated(
  base: YearInReviewCard[],
  curated: unknown
): YearInReviewCard[] {
  if (!Array.isArray(curated)) return base
  const map = new Map<string, { headline?: string; sub?: string }>()
  for (const row of curated) {
    if (!row || typeof row !== 'object') continue
    const o = row as { id?: string; headline?: string; sub?: string }
    if (typeof o.id === 'string' && o.id) map.set(o.id, o)
  }
  return base.map((c) => {
    const o = map.get(c.id)
    if (!o || typeof o.headline !== 'string' || !o.headline.trim()) return c
    return {
      id: c.id,
      headline: o.headline.trim().slice(0, 220),
      sub:
        typeof o.sub === 'string' && o.sub.trim()
          ? o.sub.trim().slice(0, 280)
          : c.sub,
    }
  })
}

export function pickStampDetailOverrides(
  stamps: { id: string }[],
  raw: unknown
): Record<string, string> {
  if (!raw || typeof raw !== 'object') return {}
  const o = raw as Record<string, unknown>
  const out: Record<string, string> = {}
  const allowed = new Set(stamps.map((s) => s.id))
  for (const id of allowed) {
    const v = o[id]
    if (typeof v === 'string' && v.trim()) out[id] = v.trim().slice(0, 220)
  }
  return out
}
