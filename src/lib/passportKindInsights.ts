import { aircraftLabel, cabinLabel } from '../data/aircraftTypes'
import type { Memory, MemoryKind } from '../types'

function restaurantCuisineValue(m: Memory): string | undefined {
  const fromList = m.selectionListValues?.['cuisine']
  if (fromList) return fromList
  return m.restaurantDetails?.cuisine
}

export interface KindInsightCard {
  id: string
  label: string
  value: string
}

function topMapKey(counts: Map<string, number>): { key: string; n: number } | null {
  let best = ''
  let n = 0
  for (const [k, v] of counts) {
    if (v > n) {
      n = v
      best = k
    }
  }
  return best && n > 0 ? { key: best, n } : null
}

export function computeInsightsForKind(
  kind: MemoryKind,
  list: Memory[],
  allMemories: Memory[]
): KindInsightCard[] {
  const cards: KindInsightCard[] = []
  if (list.length === 0) return cards

  switch (kind) {
    case 'flight': {
      const aircraft = new Map<string, number>()
      const routes = new Map<string, number>()
      const airlines = new Map<string, number>()
      const cabins = new Map<string, number>()
      let distSum = 0
      let distN = 0
      let longMin = 0
      let longLabel = ''

      for (const m of list) {
        const f = m.flightDetails
        const ac = f?.aircraftType?.trim()
        if (ac) aircraft.set(ac, (aircraft.get(ac) ?? 0) + 1)
        if (f?.fromCode && f?.toCode) {
          const r = `${f.fromCode}→${f.toCode}`
          routes.set(r, (routes.get(r) ?? 0) + 1)
        }
        const al = f?.airline?.trim()
        if (al) airlines.set(al, (airlines.get(al) ?? 0) + 1)
        const cab = f?.cabinClass?.trim()
        if (cab) cabins.set(cab, (cabins.get(cab) ?? 0) + 1)
        const dk = f?.distanceKm
        if (dk != null && Number.isFinite(dk)) {
          distSum += dk
          distN++
        }
        const dur = f?.durationMinutes
        if (dur != null && Number.isFinite(dur) && dur > longMin) {
          longMin = dur
          const h = Math.floor(dur / 60)
          const mm = dur % 60
          longLabel = h > 0 ? `${h}h ${mm}m` : `${mm}m`
        }
      }

      const ta = topMapKey(aircraft)
      if (ta)
        cards.push({
          id: 'aircraft',
          label: 'Most‑logged aircraft',
          value: `${aircraftLabel(ta.key) || ta.key} (${ta.n}×)`,
        })

      const tr = topMapKey(routes)
      if (tr)
        cards.push({
          id: 'route',
          label: 'Favorite route',
          value: `${tr.key.replace('→', ' → ')} (${tr.n}×)`,
        })

      const tal = topMapKey(airlines)
      if (tal)
        cards.push({
          id: 'airline',
          label: 'Airline flown most',
          value: `${tal.key} (${tal.n}×)`,
        })

      const tc = topMapKey(cabins)
      if (tc)
        cards.push({
          id: 'cabin',
          label: 'Cabin most often',
          value: `${cabinLabel(tc.key) || tc.key} (${tc.n}×)`,
        })

      if (distN > 0)
        cards.push({
          id: 'distance',
          label: 'Logged distance (sum)',
          value: `${Math.round(distSum)} km · ${distN} segment${distN === 1 ? '' : 's'}`,
        })

      if (longMin > 0)
        cards.push({
          id: 'longest',
          label: 'Longest block time',
          value: longLabel,
        })

      cards.push({
        id: 'count',
        label: 'Flights in passport',
        value: String(list.length),
      })
      break
    }

    case 'restaurant': {
      const cuisines = new Map<string, number>()
      let ratingSum = 0
      let ratingN = 0
      let again = 0
      let againN = 0

      const visitTimes = list
        .map((m) => Date.parse(m.visitedAt))
        .filter(Number.isFinite)
      const listEarliest =
        visitTimes.length > 0 ? Math.min(...visitTimes) : Number.POSITIVE_INFINITY
      const priorCuisine = new Set(
        allMemories
          .filter(
            (m) =>
              m.kind === 'restaurant' &&
              Number.isFinite(Date.parse(m.visitedAt)) &&
              Date.parse(m.visitedAt) < listEarliest &&
              listEarliest !== Number.POSITIVE_INFINITY
          )
          .map((m) => restaurantCuisineValue(m)?.trim())
          .filter(Boolean) as string[]
      )

      const novel = new Set<string>()
      for (const m of list) {
        const c = restaurantCuisineValue(m)?.trim()
        if (c) {
          cuisines.set(c, (cuisines.get(c) ?? 0) + 1)
          if (!priorCuisine.has(c)) novel.add(c)
        }
        const r = m.restaurantDetails?.rating
        if (r != null && Number.isFinite(r)) {
          ratingSum += r
          ratingN++
        }
        if (m.restaurantDetails?.wouldEatAgain != null) {
          againN++
          if (m.restaurantDetails.wouldEatAgain) again++
        }
      }

      const top = topMapKey(cuisines)
      if (top)
        cards.push({
          id: 'cuisine',
          label: 'Top cuisine',
          value: `${top.key} (${top.n}×)`,
        })

      if (novel.size > 0)
        cards.push({
          id: 'novel',
          label: 'New to your log',
          value: [...novel].slice(0, 5).join(', ') + (novel.size > 5 ? '…' : ''),
        })

      if (ratingN > 0)
        cards.push({
          id: 'avg-rating',
          label: 'Avg. rating',
          value: `${(ratingSum / ratingN).toFixed(1)} / 5`,
        })

      if (againN > 0)
        cards.push({
          id: 'again',
          label: 'Would eat again',
          value: `${Math.round((again / againN) * 100)}% · ${again}/${againN}`,
        })

      cards.push({
        id: 'count',
        label: 'Restaurants',
        value: String(list.length),
      })
      break
    }

    case 'hotel': {
      const brands = new Map<string, number>()
      let starsSum = 0
      let starsN = 0
      let nightsSum = 0
      let nightsN = 0

      for (const m of list) {
        const h = m.hotelDetails
        const b = h?.brand?.trim()
        if (b) brands.set(b, (brands.get(b) ?? 0) + 1)
        const st = h?.stars
        if (st != null && Number.isFinite(st)) {
          starsSum += st
          starsN++
        }
        const n = h?.nights
        if (n != null && Number.isFinite(n) && n > 0) {
          nightsSum += n
          nightsN++
        }
      }

      const tb = topMapKey(brands)
      if (tb)
        cards.push({
          id: 'brand',
          label: 'Stayed most at',
          value: `${tb.key} (${tb.n})`,
        })

      if (nightsN > 0)
        cards.push({
          id: 'nights',
          label: 'Nights logged',
          value: `${nightsSum} night${nightsSum === 1 ? '' : 's'} · ${nightsN} stay${nightsN === 1 ? '' : 's'}`,
        })

      if (starsN > 0)
        cards.push({
          id: 'stars',
          label: 'Avg. star category',
          value: `${(starsSum / starsN).toFixed(1)} / 5`,
        })

      cards.push({
        id: 'count',
        label: 'Stays',
        value: String(list.length),
      })
      break
    }

    case 'sight': {
      const types = new Map<string, number>()
      for (const m of list) {
        const t = m.sightDetails?.venueType?.trim()
        if (t) types.set(t, (types.get(t) ?? 0) + 1)
      }
      const tt = topMapKey(types)
      if (tt)
        cards.push({
          id: 'type',
          label: 'Top sight type',
          value: `${tt.key} (${tt.n}×)`,
        })
      cards.push({
        id: 'count',
        label: 'Sights',
        value: String(list.length),
      })
      break
    }

    case 'note': {
      const topics = new Map<string, number>()
      for (const m of list) {
        const t = m.noteDetails?.topic?.trim()
        if (t) topics.set(t, (topics.get(t) ?? 0) + 1)
      }
      const tp = topMapKey(topics)
      if (tp)
        cards.push({
          id: 'topic',
          label: 'Topic most often',
          value: `${tp.key} (${tp.n}×)`,
        })
      cards.push({
        id: 'count',
        label: 'Notes',
        value: String(list.length),
      })
      break
    }

    default:
      break
  }

  return cards
}
