/** Sync secret header check only — keep this file free of DB imports so /api/ai bundles stay small and stable on Vercel. */

export interface VercelRequestLike {
  headers?: { [key: string]: string | string[] | undefined }
}

export function requireAuth(req: VercelRequestLike): boolean {
  const secret = process.env.MOMENTS_SYNC_SECRET
  if (!secret || secret.length < 8) return false
  const headers = req.headers ?? {}
  const h = headers['x-moments-sync-secret']
  const v = Array.isArray(h) ? h[0] : h
  return v === secret
}
