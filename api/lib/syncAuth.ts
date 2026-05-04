/** Sync secret header check only — keep this file free of DB imports so /api/ai bundles stay small and stable on Vercel. */

export interface VercelRequestLike {
  headers?: { [key: string]: string | string[] | undefined }
}

export function requireAuth(req: VercelRequestLike): boolean {
  const secret = process.env.MOMENTS_SYNC_SECRET?.trim()
  if (!secret || secret.length < 8) return false
  const headers = req.headers ?? {}
  const h = headers['x-moments-sync-secret']
  const raw = Array.isArray(h) ? h[0] : h
  const v = typeof raw === 'string' ? raw.trim() : ''
  return v === secret
}
