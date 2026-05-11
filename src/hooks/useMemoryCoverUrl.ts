import { useEffect, useRef, useState } from 'react'
import { listPhotosForMemory } from '../db/photosDb'

/** First photo for a memory (upload order), as an object URL — revoke on change/unmount. */
export function useMemoryCoverUrl(memoryId: string): string | null {
  const [url, setUrl] = useState<string | null>(null)
  const urlRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void listPhotosForMemory(memoryId).then((rows) => {
      if (cancelled || !rows[0]) return
      const u = URL.createObjectURL(rows[0].blob)
      urlRef.current = u
      setUrl(u)
    })
    return () => {
      cancelled = true
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current)
        urlRef.current = null
      }
      setUrl(null)
    }
  }, [memoryId])

  return url
}
