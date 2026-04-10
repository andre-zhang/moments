import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ensureSchema, getPool, requireAuth } from './lib/momentsDb'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL is not configured' })
  }

  try {
    await ensureSchema()
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Database connection failed' })
  }

  if (!requireAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const pool = getPool()

  if (req.method === 'GET') {
    const memoryId = req.query.memoryId as string | undefined
    if (!memoryId) {
      return res.status(400).json({ error: 'memoryId query required' })
    }
    const { rows } = await pool.query<{
      id: string
      memory_id: string
      sort_index: number
      mime_type: string | null
      b64: string
    }>(
      `SELECT id, memory_id, sort_index, mime_type, encode(data, 'base64') AS b64
       FROM moments_photos WHERE memory_id = $1 ORDER BY sort_index ASC`,
      [memoryId]
    )
    return res.status(200).json({
      photos: rows.map((r) => ({
        id: r.id,
        memoryId: r.memory_id,
        sortIndex: r.sort_index,
        mimeType: r.mime_type ?? 'application/octet-stream',
        base64: r.b64,
      })),
    })
  }

  if (req.method === 'POST') {
    const raw =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const memoryId = raw?.memoryId as string | undefined
    const base64 = raw?.base64 as string | undefined
    const mimeType = (raw?.mimeType as string) || 'application/octet-stream'
    if (!memoryId || !base64) {
      return res.status(400).json({ error: 'memoryId and base64 required' })
    }
    let buf: Buffer
    try {
      buf = Buffer.from(base64, 'base64')
    } catch {
      return res.status(400).json({ error: 'Invalid base64' })
    }
    if (buf.length === 0) {
      return res.status(400).json({ error: 'Empty image' })
    }
    const id = `ph-${crypto.randomUUID()}`
    const { rows: nextRows } = await pool.query<{ n: string }>(
      `SELECT COALESCE(MAX(sort_index), -1) + 1 AS n FROM moments_photos WHERE memory_id = $1`,
      [memoryId]
    )
    const sortIndex = parseInt(nextRows[0]?.n ?? '0', 10)
    await pool.query(
      `INSERT INTO moments_photos (id, memory_id, sort_index, mime_type, data, updated_at)
       VALUES ($1, $2, $3, $4, $5, now())`,
      [id, memoryId, sortIndex, mimeType, buf]
    )
    return res.status(201).json({
      id,
      memoryId,
      sortIndex,
      mimeType,
    })
  }

  if (req.method === 'DELETE') {
    const id = req.query.id as string | undefined
    const memoryId = req.query.memoryId as string | undefined
    const all = req.query.all as string | undefined
    if (all === '1') {
      await pool.query('DELETE FROM moments_photos')
      return res.status(200).json({ ok: true })
    }
    if (memoryId) {
      await pool.query('DELETE FROM moments_photos WHERE memory_id = $1', [
        memoryId,
      ])
      return res.status(200).json({ ok: true })
    }
    if (id) {
      await pool.query('DELETE FROM moments_photos WHERE id = $1', [id])
      return res.status(200).json({ ok: true })
    }
    return res
      .status(400)
      .json({ error: 'Provide id, memoryId, or all=1 query param' })
  }

  res.setHeader('Allow', 'GET, POST, DELETE')
  return res.status(405).json({ error: 'Method not allowed' })
}
