/** Fired after bundled demo import or other bulk photo writes so hooks can refetch. */
const listeners = new Set<() => void>()

export function subscribePhotosUpdated(cb: () => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function notifyPhotosUpdated(): void {
  for (const cb of listeners) {
    try {
      cb()
    } catch {
      /* ignore listener errors */
    }
  }
}
