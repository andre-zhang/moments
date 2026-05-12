import { useEffect, useState } from 'react'
import { listPhotosForMemory, type PhotoRow } from '../db/photosDb'
import { subscribePhotosUpdated } from '../lib/photoDbRefresh'

function Thumb({ row }: { row: PhotoRow }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    const u = URL.createObjectURL(row.blob)
    setSrc(u)
    return () => URL.revokeObjectURL(u)
  }, [row.blob])

  return <img src={src} alt="" />
}

/** First photo as a title-card style masthead (sortIndex order = upload order). */
export function MemoryPhotoHero({ memoryId }: { memoryId: string }) {
  const [row, setRow] = useState<PhotoRow | null>(null)

  useEffect(() => {
    const load = () => {
      void listPhotosForMemory(memoryId)
        .then((r) => setRow(r[0] ?? null))
        .catch(() => setRow(null))
    }
    load()
    return subscribePhotosUpdated(load)
  }, [memoryId])

  if (!row) return null

  return (
    <div className="memory-photo-hero" aria-hidden>
      <div className="memory-photo-hero__bg">
        <Thumb row={row} />
      </div>
      <div className="memory-photo-hero__scrim" />
    </div>
  )
}

/** Horizontal strip for detail / journal */
export function PhotoStrip({
  memoryId,
  max = 6,
  skip = 0,
  className,
}: {
  memoryId: string
  max?: number
  /** Skip first N photos (e.g. 1 when first is shown as hero). */
  skip?: number
  className?: string
}) {
  const [rows, setRows] = useState<PhotoRow[]>([])

  useEffect(() => {
    const load = () => {
      void listPhotosForMemory(memoryId)
        .then((r) => setRows(r.slice(skip, skip + max)))
        .catch(() => setRows([]))
    }
    load()
    return subscribePhotosUpdated(load)
  }, [memoryId, max, skip])

  if (rows.length === 0) return null

  return (
    <ul className={className ? `photo-strip ${className}` : 'photo-strip'}>
      {rows.map((r) => (
        <li key={r.id}>
          <Thumb row={r} />
        </li>
      ))}
    </ul>
  )
}
