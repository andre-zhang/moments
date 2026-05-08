import { useEffect, useMemo } from 'react'
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
  useMapEvent,
} from 'react-leaflet'
import L from 'leaflet'
import type { Memory, MemoryKind } from '../types'
import {
  flightLineColor,
  flightRoutePolyline,
} from '../lib/flightRouteGeo'
import {
  MAP_TILE_ATTRIBUTION,
  MAP_TILE_SUBDOMAINS,
  MAP_TILE_URL,
} from '../lib/mapBasemap'
import { smoothLatLngPath } from '../lib/smoothPath'
import { KIND_EMOJI } from '../lib/kindMeta'
import { AnimatedTripPolyline } from './AnimatedTripPolyline'
import {
  MapInvalidateAfterPaint,
  MapInvalidateOnResize,
} from './mapLeafletHelpers'

function pinIcon(
  kind: MemoryKind,
  landed: boolean,
  pinEmoji?: string
) {
  const emoji = pinEmoji?.trim() || KIND_EMOJI[kind]
  const cls = `memory-pin${landed ? ' memory-pin--landed' : ''}`
  return L.divIcon({
    className: 'memory-pin-anchor',
    html: `<div class="${cls}" data-kind="${kind}">${emoji}</div>`,
    iconSize: [36, 40],
    iconAnchor: [18, 38],
  })
}

/** Flights with a drawn route use the arc only, not the saved pin. */
function usePinAtSavedLocation(m: Memory): boolean {
  if (m.kind !== 'flight') return true
  const arc = flightRoutePolyline(m)
  return !arc || arc.length < 2
}

function FitBounds({
  pinMemories,
  extraPoints,
}: {
  pinMemories: Memory[]
  extraPoints: [number, number][]
}) {
  const map = useMap()
  useEffect(() => {
    const pinPts = pinMemories.map((m) => [m.lat, m.lng] as [number, number])
    const pts = [...pinPts, ...extraPoints]
    if (pts.length === 0) return
    const b = L.latLngBounds(pts)
    map.fitBounds(b, { padding: [48, 48], maxZoom: 12, animate: false })
  }, [map, pinMemories, extraPoints])
  return null
}

function MapReadyInvalidate() {
  const map = useMap()
  useMapEvent('load', () => {
    window.setTimeout(() => map.invalidateSize(), 0)
  })
  return null
}

export function MemoryMap({
  memories,
  /** Used only for framing the map (stable when filtering by moment type). */
  memoriesForBounds,
  /** Trip line geometry when a trip is selected; defaults to `memories`. */
  lineMemories,
  showTripLine,
  linePlayKey,
  landedIds,
  showFlightRoutes,
  onSelectMemory,
}: {
  memories: Memory[]
  memoriesForBounds?: Memory[]
  lineMemories?: Memory[]
  showTripLine: boolean
  linePlayKey: number
  landedIds: Set<string>
  showFlightRoutes: boolean
  onSelectMemory?: (m: Memory) => void
}) {
  const boundsSource = memoriesForBounds ?? memories

  const pinMemories = useMemo(
    () => memories.filter(usePinAtSavedLocation),
    [memories]
  )

  const boundsPinMemories = useMemo(
    () => boundsSource.filter(usePinAtSavedLocation),
    [boundsSource]
  )

  const boundsRouteCorners = useMemo(() => {
    const out: [number, number][] = []
    for (const m of boundsSource) {
      if (m.kind !== 'flight') continue
      const positions = flightRoutePolyline(m)
      if (positions && positions.length >= 2) out.push(...positions)
    }
    return out
  }, [boundsSource])

  const center = useMemo((): [number, number] => {
    if (memories.length === 0) return [20, 0]
    const lat = memories.reduce((s, m) => s + m.lat, 0) / memories.length
    const lng = memories.reduce((s, m) => s + m.lng, 0) / memories.length
    return [lat, lng]
  }, [memories])

  const linePositions = useMemo(() => {
    const src = lineMemories ?? memories
    const sorted = [...src]
      .filter((m) => m.kind !== 'flight')
      .sort((a, b) => Date.parse(a.visitedAt) - Date.parse(b.visitedAt))
    const raw = sorted.map((m) => [m.lat, m.lng] as [number, number])
    return raw.length >= 3 ? smoothLatLngPath(raw, 10) : raw
  }, [lineMemories, memories])

  const flightArcs = useMemo(() => {
    if (!showFlightRoutes) return []
    const out: {
      id: string
      memory: Memory
      positions: [number, number][]
      color: string
    }[] = []
    for (const m of memories) {
      if (m.kind !== 'flight') continue
      const positions = flightRoutePolyline(m)
      if (!positions || positions.length < 2) continue
      out.push({
        id: m.id,
        memory: m,
        positions,
        color: flightLineColor(m.id),
      })
    }
    return out
  }, [memories, showFlightRoutes])

  return (
    <MapContainer
      center={center}
      zoom={4}
      className="memory-map"
      style={{ width: '100%', height: '100%', minHeight: 'min(72vh, 900px)' }}
      scrollWheelZoom
    >
      <MapInvalidateAfterPaint />
      <MapInvalidateOnResize />
      <MapReadyInvalidate />
      <TileLayer
        attribution={MAP_TILE_ATTRIBUTION}
        url={MAP_TILE_URL}
        subdomains={MAP_TILE_SUBDOMAINS}
        maxZoom={20}
      />
      {boundsPinMemories.length > 0 || boundsRouteCorners.length > 0 ? (
        <FitBounds
          pinMemories={boundsPinMemories}
          extraPoints={boundsRouteCorners}
        />
      ) : null}
      {flightArcs.map((arc) => (
        <Polyline
          key={arc.id}
          positions={arc.positions}
          pathOptions={{
            color: arc.color,
            weight: 4,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }}
          eventHandlers={
            onSelectMemory
              ? {
                  click: (e) => {
                    if (e.originalEvent)
                      L.DomEvent.stopPropagation(e.originalEvent)
                    onSelectMemory(arc.memory)
                  },
                }
              : undefined
          }
        />
      ))}
      {showTripLine && linePositions.length >= 2 ? (
        <AnimatedTripPolyline
          positions={linePositions}
          color="#5c3d9e"
          playKey={linePlayKey}
        />
      ) : null}
      {pinMemories.map((m) => (
        <Marker
          key={`${m.id}-${landedIds.has(m.id) ? 'b' : 'a'}`}
          position={[m.lat, m.lng]}
          icon={pinIcon(m.kind, landedIds.has(m.id), m.pinEmoji)}
          eventHandlers={
            onSelectMemory
              ? {
                  click: (e) => {
                    if (e.originalEvent)
                      L.DomEvent.stopPropagation(e.originalEvent)
                    onSelectMemory(m)
                  },
                }
              : undefined
          }
        />
      ))}
    </MapContainer>
  )
}
