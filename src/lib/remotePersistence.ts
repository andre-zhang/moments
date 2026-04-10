import { apiUrl, isNeonSyncEnabled, syncHeaders } from './syncEnv'

let saveTimer: ReturnType<typeof setTimeout> | null = null

/** Set false when the initial `/api/state` load fails so we fall back to local storage for the session. */
let sessionRemoteOk = true

export function markRemotePersistenceFailed(): void {
  sessionRemoteOk = false
}

export function remotePersistenceActive(): boolean {
  return sessionRemoteOk && isNeonSyncEnabled()
}

export async function fetchRemoteState(): Promise<unknown | null> {
  const r = await fetch(apiUrl('/api/state'), { headers: syncHeaders() })
  if (r.status === 401) throw new Error('unauthorized')
  if (!r.ok) throw new Error(`state ${r.status}`)
  const j = (await r.json()) as { data: unknown | null }
  return j.data ?? null
}

export async function putRemoteState(data: unknown): Promise<void> {
  const r = await fetch(apiUrl('/api/state'), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...syncHeaders(),
    },
    body: JSON.stringify({ data }),
  })
  if (!r.ok) throw new Error(`save state ${r.status}`)
}

export function scheduleRemoteSave(data: unknown): void {
  if (!remotePersistenceActive()) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveTimer = null
    void putRemoteState(data).catch((e) => console.error('[Moments] remote save', e))
  }, 900)
}

export function cancelScheduledRemoteSave(): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = null
}

export async function flushRemoteSaveNow(data: unknown): Promise<void> {
  cancelScheduledRemoteSave()
  await putRemoteState(data)
}
