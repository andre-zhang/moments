import { addPhotoToMemory, listPhotosForMemory } from '../db/photosDb'
import { DEMO_MEMORY_PHOTO_BINDINGS } from './demoSamplePhotos'
import { isNeonSyncEnabled } from './syncEnv'

/**
 * Copies bundled `public/sample-photos/*` into the local photo DB for demo moments
 * (local / offline mode only). Safe to call repeatedly — skips memories that already have photos.
 */
export async function ensureDemoSamplePhotosImported(): Promise<void> {
  if (isNeonSyncEnabled()) return

  for (const b of DEMO_MEMORY_PHOTO_BINDINGS) {
    const existing = await listPhotosForMemory(b.memoryId)
    if (existing.length > 0) continue

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
    await addPhotoToMemory(b.memoryId, file)
  }
}
