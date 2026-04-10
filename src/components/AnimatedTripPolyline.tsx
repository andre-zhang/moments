import { useEffect, useState } from 'react'
import { Polyline } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'

const DURATION_MS = 1800

export function AnimatedTripPolyline({
  positions,
  color,
  playKey,
}: {
  positions: LatLngExpression[]
  color: string
  playKey: number
}) {
  const [segment, setSegment] = useState<LatLngExpression[]>([])

  useEffect(() => {
    if (positions.length < 2) {
      setSegment(positions)
      return
    }

    let raf = 0
    let cancelled = false
    const start = performance.now()

    const tick = (now: number) => {
      if (cancelled) return
      const t = Math.min(1, (now - start) / DURATION_MS)
      const n = positions.length
      const extra = Math.max(0, n - 2)
      const count =
        extra === 0
          ? n
          : Math.min(n, Math.max(2, 2 + Math.floor(t * extra)))
      setSegment(positions.slice(0, count))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    setSegment([positions[0], positions[1]])
    raf = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [playKey, positions])

  if (segment.length < 2) return null

  return (
    <Polyline
      key={`line-${playKey}`}
      positions={segment}
      pathOptions={{
        color,
        weight: 4,
        opacity: 0.92,
        lineCap: 'round',
        lineJoin: 'round',
      }}
    />
  )
}
