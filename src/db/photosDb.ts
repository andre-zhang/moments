import { remotePersistenceActive } from '../lib/remotePersistence'
import * as local from './photosLocal'
import * as remote from './photosRemote'

export type PhotoRow = local.PhotoRow

export async function migratePhotosDbFromLegacy(): Promise<void> {
  return local.migratePhotosDbFromLegacy()
}

export async function listPhotosForMemory(memoryId: string): Promise<PhotoRow[]> {
  const localRows = await local.listPhotosForMemory(memoryId)
  if (localRows.length > 0) return localRows
  if (remotePersistenceActive()) {
    try {
      return await remote.listPhotosForMemory(memoryId)
    } catch {
      return []
    }
  }
  return localRows
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
  const row = await local.addPhotoToMemory(memoryId, file)
  if (remotePersistenceActive()) {
    try {
      await remote.addPhotoToMemory(memoryId, file)
    } catch {
      /* local copy is enough for UI */
    }
  }
  return row
}

export async function deletePhoto(id: string): Promise<void> {
  await local.deletePhoto(id)
  if (remotePersistenceActive()) {
    try {
      await remote.deletePhoto(id)
    } catch {
      /* ignore */
    }
  }
}

export async function deleteAllPhotosForMemory(memoryId: string): Promise<void> {
  await local.deleteAllPhotosForMemory(memoryId)
  if (remotePersistenceActive()) {
    try {
      await remote.deleteAllPhotosForMemory(memoryId)
    } catch {
      /* ignore */
    }
  }
}

export async function deleteAllPhotosForMemories(memoryIds: string[]): Promise<void> {
  await Promise.all(memoryIds.map((id) => deleteAllPhotosForMemory(id)))
}

export async function clearAllPhotos(): Promise<void> {
  await local.clearAllPhotos()
  if (remotePersistenceActive()) {
    try {
      await remote.clearAllPhotos()
    } catch {
      /* ignore */
    }
  }
}
