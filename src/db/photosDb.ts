import Dexie, { type Table } from 'dexie'

export interface PhotoRow {
  id: string
  memoryId: string
  sortIndex: number
  blob: Blob
}

const DB_NAME = 'moments-photos'
const LEGACY_PHOTOS_DB = 'wanderlog-photos'

class PhotosDB extends Dexie {
  photos!: Table<PhotoRow, string>

  constructor() {
    super(DB_NAME)
    this.version(1).stores({
      photos: 'id, memoryId, sortIndex',
    })
  }
}

export const photosDb = new PhotosDB()

class LegacyPhotosDB extends Dexie {
  photos!: Table<PhotoRow, string>

  constructor() {
    super(LEGACY_PHOTOS_DB)
    this.version(1).stores({
      photos: 'id, memoryId, sortIndex',
    })
  }
}

/** One-time copy from pre-rename IndexedDB so existing photos are kept. */
export async function migratePhotosDbFromLegacy(): Promise<void> {
  try {
    const legacyExists = await Dexie.exists(LEGACY_PHOTOS_DB)
    if (!legacyExists) return
    const newCount = await photosDb.photos.count()
    if (newCount > 0) return

    const legacy = new LegacyPhotosDB()
    const rows = await legacy.photos.toArray()
    if (rows.length > 0) {
      await photosDb.transaction('rw', photosDb.photos, async () => {
        await photosDb.photos.bulkAdd(rows)
      })
    }
    await legacy.delete()
  } catch {
    /* ignore migration errors */
  }
}

export async function listPhotosForMemory(memoryId: string): Promise<PhotoRow[]> {
  return photosDb.photos.where('memoryId').equals(memoryId).sortBy('sortIndex')
}

/** Photos for many moments, in visit order (memoryIds order), each memory sorted by sortIndex. */
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
  const existing = await photosDb.photos.where('memoryId').equals(memoryId).count()
  const row: PhotoRow = {
    id: `ph-${crypto.randomUUID()}`,
    memoryId,
    sortIndex: existing,
    blob: file,
  }
  await photosDb.photos.add(row)
  return row
}

export async function deletePhoto(id: string): Promise<void> {
  await photosDb.photos.delete(id)
}

export async function deleteAllPhotosForMemory(memoryId: string): Promise<void> {
  await photosDb.photos.where('memoryId').equals(memoryId).delete()
}

export async function deleteAllPhotosForMemories(memoryIds: string[]): Promise<void> {
  await Promise.all(memoryIds.map((id) => deleteAllPhotosForMemory(id)))
}

export async function clearAllPhotos(): Promise<void> {
  await photosDb.photos.clear()
}
