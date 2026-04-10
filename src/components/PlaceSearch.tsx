import { useEffect, useRef, useState } from 'react'
import { photonSearch, type PhotonHit } from '../lib/photon'

export function PlaceSearch({
  value,
  onChange,
  onPick,
  /** First search result — move map pin as user types (not committed until pick). */
  onGeocodePreview,
}: {
  value: string
  onChange: (q: string) => void
  onPick: (hit: PhotonHit) => void
  onGeocodePreview?: (hit: PhotonHit | null) => void
}) {
  const [hits, setHits] = useState<PhotonHit[]>([])
  const [loading, setLoading] = useState(false)
  const previewRef = useRef(onGeocodePreview)
  previewRef.current = onGeocodePreview

  useEffect(() => {
    const q = value.trim()
    if (q.length < 2) {
      setHits([])
      previewRef.current?.(null)
      return
    }
    let cancelled = false
    setLoading(true)
    const t = window.setTimeout(() => {
      photonSearch(q)
        .then((h) => {
          if (!cancelled) {
            setHits(h)
            previewRef.current?.(h[0] ?? null)
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 280)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [value])

  return (
    <div className="place-search">
      <label>
        Search to jump the map pin
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="City, address, venue…"
          autoComplete="off"
        />
      </label>
      {loading ? <p className="place-search-status">Searching…</p> : null}
      {hits.length > 0 ? (
        <ul className="place-search-hits">
          {hits.map((h, i) => (
            <li key={`${h.lat}-${h.lng}-${i}`}>
              <button type="button" onClick={() => onPick(h)}>
                {h.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
