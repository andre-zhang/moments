import { useCallback, useEffect, useState } from 'react'
import {
  addPhotoToMemory,
  deletePhoto,
  listPhotosForMemory,
  type PhotoRow,
} from '../db/photosDb'

function PhotoTile({
  row,
  onRemove,
}: {
  row: PhotoRow
  onRemove: () => void
}) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    const u = URL.createObjectURL(row.blob)
    setSrc(u)
    return () => URL.revokeObjectURL(u)
  }, [row.blob])

  return (
    <li className="photo-tile">
      <img src={src} alt="" />
      <button type="button" onClick={onRemove}>
        Remove
      </button>
    </li>
  )
}

export function PhotoUploader({ memoryId }: { memoryId: string }) {
  const [rows, setRows] = useState<PhotoRow[]>([])

  const refresh = useCallback(async () => {
    setRows(await listPhotosForMemory(memoryId))
  }, [memoryId])

  useEffect(() => {
    void refresh()
  }, [memoryId, refresh])

  const onFiles: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = e.target.files
    if (!files?.length) return
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      await addPhotoToMemory(memoryId, file)
    }
    e.target.value = ''
    void refresh()
  }

  const remove = async (id: string) => {
    await deletePhoto(id)
    void refresh()
  }

  return (
    <div className="photo-uploader">
      <label className="photo-uploader-field">
        <span className="photo-uploader-label">Images</span>
        <span className="photo-uploader-control">
          <input
            type="file"
            accept="image/*"
            multiple
            className="photo-uploader-native"
            onChange={onFiles}
          />
          <span className="photo-uploader-btn" aria-hidden>
            Choose files
          </span>
          <span className="photo-uploader-hint">
            Stored on this device only · JPG, PNG, or WebP
          </span>
        </span>
      </label>
      {rows.length > 0 ? (
        <ul className="photo-grid">
          {rows.map((r) => (
            <PhotoTile key={r.id} row={r} onRemove={() => remove(r.id)} />
          ))}
        </ul>
      ) : (
        <p className="photo-uploader-empty form-hint">No images attached yet.</p>
      )}
    </div>
  )
}
