import { apiUrl, syncHeaders } from '../lib/syncEnv'

export interface PhotoRow {
  id: string
  memoryId: string
  sortIndex: number
  blob: Blob
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: mimeType || 'application/octet-stream' })
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => {
      const s = fr.result as string
      const i = s.indexOf(',')
      resolve(i >= 0 ? s.slice(i + 1) : s)
    }
    fr.onerror = () => reject(fr.error)
    fr.readAsDataURL(file)
  })
}

export async function listPhotosForMemory(memoryId: string): Promise<PhotoRow[]> {
  const r = await fetch(
    `${apiUrl('/api/photos')}?memoryId=${encodeURIComponent(memoryId)}`,
    { headers: syncHeaders() }
  )
  if (!r.ok) throw new Error(`list photos ${r.status}`)
  const j = (await r.json()) as {
    photos: Array<{
      id: string
      memoryId: string
      sortIndex: number
      mimeType: string
      base64: string
    }>
  }
  return j.photos.map((p) => ({
    id: p.id,
    memoryId: p.memoryId,
    sortIndex: p.sortIndex,
    blob: base64ToBlob(p.base64, p.mimeType),
  }))
}

export async function listPhotosForMemoryIds(
  memoryIds: string[],
  maxPerMemory = 20
): Promise<PhotoRow[]> {
  const out: PhotoRow[] = []
  for (const id of memoryIds) {
    const rows = await listPhotosForMemory(id)
    out.push(...rows.slice(0, maxPerMemory))
  }
  return out
}

export async function addPhotoToMemory(memoryId: string, file: File): Promise<PhotoRow> {
  const base64 = await fileToBase64(file)
  const r = await fetch(apiUrl('/api/photos'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...syncHeaders(),
    },
    body: JSON.stringify({
      memoryId,
      mimeType: file.type || 'application/octet-stream',
      base64,
    }),
  })
  if (!r.ok) throw new Error(`add photo ${r.status}`)
  const j = (await r.json()) as {
    id: string
    memoryId: string
    sortIndex: number
    mimeType: string
  }
  return {
    id: j.id,
    memoryId: j.memoryId,
    sortIndex: j.sortIndex,
    blob: file,
  }
}

export async function deletePhoto(id: string): Promise<void> {
  const r = await fetch(`${apiUrl('/api/photos')}?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: syncHeaders(),
  })
  if (!r.ok) throw new Error(`delete photo ${r.status}`)
}

export async function deleteAllPhotosForMemory(memoryId: string): Promise<void> {
  const r = await fetch(
    `${apiUrl('/api/photos')}?memoryId=${encodeURIComponent(memoryId)}`,
    { method: 'DELETE', headers: syncHeaders() }
  )
  if (!r.ok) throw new Error(`delete photos for memory ${r.status}`)
}

export async function deleteAllPhotosForMemories(memoryIds: string[]): Promise<void> {
  await Promise.all(memoryIds.map((id) => deleteAllPhotosForMemory(id)))
}

export async function clearAllPhotos(): Promise<void> {
  const r = await fetch(`${apiUrl('/api/photos')}?all=1`, {
    method: 'DELETE',
    headers: syncHeaders(),
  })
  if (!r.ok) throw new Error(`clear photos ${r.status}`)
}
