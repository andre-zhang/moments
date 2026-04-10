import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export function MapInvalidateOnResize() {
  const map = useMap()
  useEffect(() => {
    const el = map.getContainer()
    const parent = el.parentElement
    const ro = new ResizeObserver(() => {
      map.invalidateSize({ animate: false })
    })
    if (parent) ro.observe(parent)
    ro.observe(el)
    const t = window.setTimeout(() => map.invalidateSize(), 80)
    return () => {
      ro.disconnect()
      window.clearTimeout(t)
    }
  }, [map])
  return null
}

export function MapInvalidateAfterPaint() {
  const map = useMap()
  useEffect(() => {
    const run = () => map.invalidateSize({ animate: false })
    const raf = requestAnimationFrame(run)
    const t1 = window.setTimeout(run, 120)
    const t2 = window.setTimeout(run, 380)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [map])
  return null
}
