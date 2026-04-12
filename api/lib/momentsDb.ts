import { Pool } from '@neondatabase/serverless'

export { requireAuth, type VercelRequestLike } from './syncAuth'

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not set')
    pool = new Pool({ connectionString: url })
  }
  return pool
}

let schemaReady: Promise<void> | null = null

export async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    const p = getPool()
    schemaReady = (async () => {
      await p.query(`
        CREATE TABLE IF NOT EXISTS moments_app_state (
          id text PRIMARY KEY,
          data text NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `)
      await p.query(`
        CREATE TABLE IF NOT EXISTS moments_photos (
          id text PRIMARY KEY,
          memory_id text NOT NULL,
          sort_index integer NOT NULL,
          mime_type text,
          data bytea NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `)
      await p.query(`
        CREATE INDEX IF NOT EXISTS moments_photos_memory_id_idx
        ON moments_photos (memory_id)
      `)
    })()
  }
  await schemaReady
}

const STATE_ROW_ID = 'default'

export { STATE_ROW_ID }
