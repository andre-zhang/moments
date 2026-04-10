import { useEffect, useState } from 'react'
import { listPhotosForMemory, type PhotoRow } from '../db/photosDb'

function Thumb({ row }: { row: PhotoRow }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    const u = URL.createObjectURL(row.blob)
    setSrc(u)
    return () => URL.revokeObjectURL(u)
  }, [row.blob])

  return <img src={src} alt="" />
}

/** Horizontal strip for detail / journal */
export function PhotoStrip({
  memoryId,
  max = 6,
  className,
}: {
  memoryId: string
  max?: number
  className?: string
}) {
  const [rows, setRows] = useState<PhotoRow[]>([])

  useEffect(() => {
    void listPhotosForMemory(memoryId).then((r) => setRows(r.slice(0, max)))
  }, [memoryId, max])

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
