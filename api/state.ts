import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ensureSchema, getPool, requireAuth, STATE_ROW_ID } from './lib/momentsDb'

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
    const { rows } = await pool.query<{ data: string }>(
      'SELECT data FROM moments_app_state WHERE id = $1',
      [STATE_ROW_ID]
    )
    const row = rows[0]
    if (!row) {
      return res.status(200).json({ data: null })
    }
    try {
      const data = JSON.parse(row.data) as unknown
      return res.status(200).json({ data })
    } catch {
      return res.status(500).json({ error: 'Stored state is invalid JSON' })
    }
  }

  if (req.method === 'PUT') {
    const raw =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const data = raw?.data ?? raw
    if (data == null || typeof data !== 'object') {
      return res.status(400).json({ error: 'Expected JSON object body' })
    }
    const text = JSON.stringify(data)
    await pool.query(
      `INSERT INTO moments_app_state (id, data, updated_at)
       VALUES ($1, $2, now())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [STATE_ROW_ID, text]
    )
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', 'GET, PUT')
  return res.status(405).json({ error: 'Method not allowed' })
}
