import * as photosLocal from '../db/photosLocal'
import { DEMO_MEMORY_PHOTO_PLANS } from './demoSamplePhotos'
import { notifyPhotosUpdated } from './photoDbRefresh'

/** Bump when demo thumb URLs change so existing IndexedDB blobs refresh once. */
const DEMO_PHOTOS_IMPORT_VERSION = 'commons-1920-v3'
const DEMO_PHOTOS_VERSION_KEY = 'moments-demo-photos-import-version'

export type EnsureDemoSamplePhotosOptions = {
  /** @deprecated Demo photos always import to local IndexedDB; kept for call sites. */
  bypassNeonGuard?: boolean
}

async function fetchDemoBlob(src: string): Promise<Blob | null> {
  try {
    const crossOrigin = /^https?:\/\//i.test(src)
    const res = await fetch(src, {
      credentials: 'omit',
      mode: crossOrigin ? 'cors' : 'same-origin',
      referrerPolicy: 'no-referrer',
    })
    if (!res.ok) return null
    return await res.blob()
  } catch {
    return null
  }
}

/**
 * Fetches demo moment images into local IndexedDB (always — not gated on Neon state sync).
 * Safe to call repeatedly; re-imports when the version key changes.
 */
export async function ensureDemoSamplePhotosImported(
  _options?: EnsureDemoSamplePhotosOptions
): Promise<void> {
  await photosLocal.migratePhotosDbFromLegacy()

  let storedVersion: string | null = null
  try {
    storedVersion = localStorage.getItem(DEMO_PHOTOS_VERSION_KEY)
  } catch {
    /* ignore */
  }
  const needsFullReimport = storedVersion !== DEMO_PHOTOS_IMPORT_VERSION

  if (needsFullReimport) {
    for (const plan of DEMO_MEMORY_PHOTO_PLANS) {
      await photosLocal.deleteAllPhotosForMemory(plan.memoryId)
    }
  }

  let added = 0
  for (const plan of DEMO_MEMORY_PHOTO_PLANS) {
    const existing = await photosLocal.listPhotosForMemory(plan.memoryId)
    const missing = needsFullReimport
      ? plan.photos
      : plan.photos.slice(existing.length)
    for (const b of missing) {
      const blob = await fetchDemoBlob(b.src)
      if (!blob || blob.size < 512) continue
      const file = new File([blob], b.fileName, {
        type: blob.type.startsWith('image/') ? blob.type : 'image/jpeg',
      })
      await photosLocal.addPhotoToMemory(plan.memoryId, file)
      added++
    }
  }

  if (needsFullReimport) {
    const withCover = await Promise.all(
      DEMO_MEMORY_PHOTO_PLANS.map(async (p) => ({
        id: p.memoryId,
        n: (await photosLocal.listPhotosForMemory(p.memoryId)).length,
      }))
    )
    const covered = withCover.filter((x) => x.n > 0).length
    if (covered >= Math.min(8, DEMO_MEMORY_PHOTO_PLANS.length)) {
      try {
        localStorage.setItem(DEMO_PHOTOS_VERSION_KEY, DEMO_PHOTOS_IMPORT_VERSION)
      } catch {
        /* ignore */
      }
    } else {
      try {
        localStorage.removeItem(DEMO_PHOTOS_VERSION_KEY)
      } catch {
        /* ignore */
      }
    }
  }

  if (added > 0) notifyPhotosUpdated()
}
