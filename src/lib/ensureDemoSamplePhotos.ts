import { addPhotoToMemory, listPhotosForMemory } from '../db/photosDb'
import { DEMO_MEMORY_PHOTO_PLANS } from './demoSamplePhotos'
import { notifyPhotosUpdated } from './photoDbRefresh'
import { isNeonSyncEnabled } from './syncEnv'

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

  for (const plan of DEMO_MEMORY_PHOTO_PLANS) {
    const existing = await listPhotosForMemory(plan.memoryId)
    const missing = plan.photos.slice(existing.length)
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
