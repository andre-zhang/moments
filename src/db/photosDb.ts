import { remotePersistenceActive } from '../lib/remotePersistence'
import * as local from './photosLocal'
import * as remote from './photosRemote'

export type PhotoRow = local.PhotoRow

const impl = () => (remotePersistenceActive() ? remote : local)

export async function migratePhotosDbFromLegacy(): Promise<void> {
  if (remotePersistenceActive()) return
  return local.migratePhotosDbFromLegacy()
}

export async function listPhotosForMemory(memoryId: string): Promise<PhotoRow[]> {
  return impl().listPhotosForMemory(memoryId)
}

export async function listPhotosForMemoryIds(
  memoryIds: string[],
  maxPerMemory = 20
): Promise<PhotoRow[]> {
  return impl().listPhotosForMemoryIds(memoryIds, maxPerMemory)
}

export async function addPhotoToMemory(memoryId: string, file: File): Promise<PhotoRow> {
  return impl().addPhotoToMemory(memoryId, file)
}

export async function deletePhoto(id: string): Promise<void> {
  return impl().deletePhoto(id)
}

export async function deleteAllPhotosForMemory(memoryId: string): Promise<void> {
  return impl().deleteAllPhotosForMemory(memoryId)
}

export async function deleteAllPhotosForMemories(memoryIds: string[]): Promise<void> {
  return impl().deleteAllPhotosForMemories(memoryIds)
}

export async function clearAllPhotos(): Promise<void> {
  return impl().clearAllPhotos()
}
