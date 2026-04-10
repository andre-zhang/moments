import { useEffect, useRef } from 'react'
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import {
  MapInvalidateAfterPaint,
  MapInvalidateOnResize,
} from './mapLeafletHelpers'

function MapClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function RecenterOnFocus({
  lat,
  lng,
  focusKey,
}: {
  lat: number
  lng: number
  focusKey: number
}) {
  const map = useMap()
  const pos = useRef({ lat, lng })
  pos.current = { lat, lng }
  useEffect(() => {
    const { lat: la, lng: ln } = pos.current
    map.setView([la, ln], Math.max(map.getZoom(), 13), { animate: true })
  }, [focusKey, map])
  return null
}

export function LocationMapPicker({
  lat,
  lng,
  focusKey,
  mapKey,
  onChange,
}: {
  lat: number
  lng: number
  focusKey: number
  /** Remount map when layout/context changes (e.g. new vs edit moment). */
  mapKey?: string
  onChange: (lat: number, lng: number) => void
}) {
  return (
    <div className="location-map-picker">
      <MapContainer
        key={mapKey ?? 'map'}
        center={[lat, lng]}
        zoom={13}
        className="location-map-picker__map"
        scrollWheelZoom
      >
        <MapInvalidateAfterPaint />
        <MapInvalidateOnResize />
        <RecenterOnFocus lat={lat} lng={lng} focusKey={focusKey} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <Marker
          position={[lat, lng]}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const p = e.target.getLatLng()
              onChange(p.lat, p.lng)
            },
          }}
        />
        <MapClickHandler onPick={onChange} />
      </MapContainer>
    </div>
  )
}
