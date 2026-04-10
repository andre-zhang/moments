/** Same value as server env `MOMENTS_SYNC_SECRET` (set in Vercel for Production + Preview builds). */
export function isNeonSyncEnabled(): boolean {
  const s = import.meta.env.VITE_MOMENTS_SYNC_SECRET
  return typeof s === 'string' && s.length >= 8
}

/** Optional override when the UI is not same-origin as `/api` (e.g. local Vite → `vercel dev`). */
export function apiOrigin(): string {
  return (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? ''
}

export function syncHeaders(): HeadersInit {
  const s = import.meta.env.VITE_MOMENTS_SYNC_SECRET
  if (typeof s !== 'string' || s.length < 8) return {}
  return { 'x-moments-sync-secret': s }
}

export function apiUrl(path: string): string {
  const base = apiOrigin()
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}
