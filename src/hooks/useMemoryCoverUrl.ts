import { useEffect, useRef, useState } from 'react'
import { listPhotosForMemory } from '../db/photosDb'
import { subscribePhotosUpdated } from '../lib/photoDbRefresh'

/** First photo for a memory (upload order), as an object URL — revoke on change/unmount. */
export function useMemoryCoverUrl(memoryId: string): string | null {
  const [url, setUrl] = useState<string | null>(null)
  const urlRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const applyRows = (rows: Awaited<ReturnType<typeof listPhotosForMemory>>) => {
      if (cancelled) return
      if (!rows[0]) {
        if (urlRef.current) {
          URL.revokeObjectURL(urlRef.current)
          urlRef.current = null
        }
        setUrl(null)
        return
      }
      const u = URL.createObjectURL(rows[0].blob)
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      urlRef.current = u
      setUrl(u)
    }

    const load = () => {
      void listPhotosForMemory(memoryId)
        .then(applyRows)
        .catch(() => applyRows([]))
    }

    load()
    const unsub = subscribePhotosUpdated(load)
    return () => {
      cancelled = true
      unsub()
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current)
        urlRef.current = null
      }
      setUrl(null)
    }
  }, [memoryId])

  return url
}
