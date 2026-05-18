import {
  addPhotoToMemory,
  deleteAllPhotosForMemory,
  listPhotosForMemory,
} from '../db/photosDb'
import { DEMO_MEMORY_PHOTO_PLANS } from './demoSamplePhotos'
import { notifyPhotosUpdated } from './photoDbRefresh'
import { isNeonSyncEnabled } from './syncEnv'

/** Bump when demo thumb URLs change so existing IndexedDB blobs refresh once. */
const DEMO_PHOTOS_IMPORT_VERSION = 'commons-1920-v2'
const DEMO_PHOTOS_VERSION_KEY = 'moments-demo-photos-import-version'

export type EnsureDemoSamplePhotosOptions = {
  /** When true, run even if Neon sync env is set (e.g. after “Load demo” so photos hit the remote API). */
  bypassNeonGuard?: boolean
}

/**
 * Fetches demo moment images (Wikimedia Commons thumbnails from plans) into the photo store.
 * Safe to call repeatedly — skips files already satisfied per memory.
 * By default skipped when Neon sync is enabled (avoid surprise uploads on every load);
 * use `bypassNeonGuard` after an explicit demo reset.
 */
export async function ensureDemoSamplePhotosImported(
  options?: EnsureDemoSamplePhotosOptions
): Promise<void> {
  if (isNeonSyncEnabled() && !options?.bypassNeonGuard) return

  let storedVersion: string | null = null
  try {
    storedVersion = localStorage.getItem(DEMO_PHOTOS_VERSION_KEY)
  } catch {
    /* ignore */
  }
  const needsFullReimport = storedVersion !== DEMO_PHOTOS_IMPORT_VERSION
  if (needsFullReimport) {
    for (const plan of DEMO_MEMORY_PHOTO_PLANS) {
      await deleteAllPhotosForMemory(plan.memoryId)
    }
    try {
      localStorage.setItem(DEMO_PHOTOS_VERSION_KEY, DEMO_PHOTOS_IMPORT_VERSION)
    } catch {
      /* ignore */
    }
  }

  for (const plan of DEMO_MEMORY_PHOTO_PLANS) {
    const existing = await listPhotosForMemory(plan.memoryId)
    const missing = needsFullReimport
      ? plan.photos
      : plan.photos.slice(existing.length)
    for (const b of missing) {
      let res: Response
      try {
        const crossOrigin = /^https?:\/\//i.test(b.src)
        res = await fetch(b.src, {
          credentials: 'omit',
          mode: crossOrigin ? 'cors' : 'same-origin',
        })
      } catch {
        continue
      }
      if (!res.ok) continue

      const blob = await res.blob()
      const file = new File([blob], b.fileName, {
        type: blob.type || 'image/jpeg',
      })
      await addPhotoToMemory(plan.memoryId, file)
    }
  }
  notifyPhotosUpdated()
}
