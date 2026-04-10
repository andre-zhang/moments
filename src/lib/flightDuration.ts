/** Format stored minutes as "6 h 30 min" / "45 min" / "2 h". */
export function formatDurationMinutes(total: number | undefined | null): string {
  if (total == null || !Number.isFinite(total) || total <= 0) return ''
  const n = Math.round(total)
  const h = Math.floor(n / 60)
  const m = n % 60
  if (h > 0 && m > 0) return `${h} h ${m} min`
  if (h > 0) return `${h} h`
  return `${m} min`
}

export function splitDurationMinutes(
  total: number | undefined | null
): { hours: string; minutes: string } {
  if (total == null || !Number.isFinite(total) || total <= 0)
    return { hours: '', minutes: '' }
  const n = Math.round(total)
  return { hours: String(Math.floor(n / 60)), minutes: String(n % 60) }
}

export function joinDurationMinutes(
  hoursStr: string,
  minutesStr: string
): number | undefined {
  const h = Math.max(0, parseInt(hoursStr, 10) || 0)
  const m = Math.max(0, parseInt(minutesStr, 10) || 0)
  const t = h * 60 + m
  return t > 0 ? t : undefined
}
