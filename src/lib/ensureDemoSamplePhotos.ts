import { addPhotoToMemory, listPhotosForMemory } from '../db/photosDb'
import { DEMO_MEMORY_PHOTO_PLANS } from './demoSamplePhotos'
import { isNeonSyncEnabled } from './syncEnv'

/**
 * Copies bundled `public/sample-photos/*` into the local photo DB for demo moments
 * (local / offline mode only). Safe to call repeatedly — skips memories that already have photos.
 */
export async function ensureDemoSamplePhotosImported(): Promise<void> {
  if (isNeonSyncEnabled()) return

  for (const plan of DEMO_MEMORY_PHOTO_PLANS) {
    const existing = await listPhotosForMemory(plan.memoryId)
    const missing = plan.photos.slice(existing.length)
    for (const b of missing) {
      let res: Response
      try {
        res = await fetch(b.src, { credentials: 'same-origin' })
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
}
