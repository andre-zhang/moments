import { useCallback, useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  ZoomControl,
  useMap,
} from 'react-leaflet'
import { listPhotosForMemoryIds, type PhotoRow } from '../../db/photosDb'
import { KIND_EMOJI, KIND_LABEL } from '../../lib/kindMeta'
import type { Memory, TagCategory } from '../../types'
import type { StorybookTourStep } from '../../lib/buildStorybookTour'
import {
  MapInvalidateAfterPaint,
  MapInvalidateOnResize,
} from '../mapLeafletHelpers'
import { useTravel } from '../../store/travelStore'

function storybookStepIcon(index: number, active: boolean) {
  return L.divIcon({
    className: 'storybook-marker-anchor',
    html: `<div class="storybook-marker${active ? ' storybook-marker--active' : ''}">${index + 1}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  })
}

function StorybookFlyTo({
  steps,
  slide,
  enabled,
}: {
  steps: StorybookTourStep[]
  slide: number
  enabled: boolean
}) {
  const map = useMap()
  useEffect(() => {
    if (!enabled) return
    const s = steps[slide]
    if (!s || !Number.isFinite(s.lat) || !Number.isFinite(s.lng)) return
    map.flyTo([s.lat, s.lng], 12, { duration: 1.35 })
  }, [map, steps, slide, enabled])
  return null
}

function PhotoThumb({ row }: { row: PhotoRow }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    const u = URL.createObjectURL(row.blob)
    setSrc(u)
    return () => URL.revokeObjectURL(u)
  }, [row.blob])

  return <img src={src} alt="" className="storybook-photo-img" />
}

function SlidePhotos({ memoryIds }: { memoryIds: string[] }) {
  const [rows, setRows] = useState<PhotoRow[]>([])
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    setIdx(0)
    void listPhotosForMemoryIds(memoryIds, 16).then(setRows)
  }, [memoryIds])

  useEffect(() => {
    if (rows.length <= 1) return
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % rows.length)
    }, 5200)
    return () => window.clearInterval(t)
  }, [rows.length])

  if (rows.length === 0) return null

  const main = rows[idx]!

  return (
    <div className="storybook-slide-photos">
      <div className="storybook-photo-hero" key={main.id}>
        <PhotoThumb row={main} />
      </div>
      {rows.length > 1 ? (
        <div className="storybook-photo-dots" aria-hidden>
          {rows.map((r, i) => (
            <button
              key={r.id}
              type="button"
              className={`storybook-photo-dot${i === idx ? ' storybook-photo-dot--on' : ''}`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function memoryTagGroups(
  m: Memory,
  categories: TagCategory[]
): { categoryLabel: string; tags: string[] }[] {
  if (!m.categoryTags) return []
  const out: { categoryLabel: string; tags: string[] }[] = []
  for (const c of categories) {
    const tags = m.categoryTags[c.id]
    if (tags?.length) out.push({ categoryLabel: c.label, tags })
  }
  return out
}

function StorybookMemoryVeil({
  memory,
  placeName,
  onClose,
}: {
  memory: Memory
  placeName: string
  onClose: () => void
}) {
  const { state } = useTravel()
  const [rows, setRows] = useState<PhotoRow[]>([])
  const [photoIdx, setPhotoIdx] = useState(0)

  useEffect(() => {
    setPhotoIdx(0)
    void listPhotosForMemoryIds([memory.id], 32).then(setRows)
  }, [memory.id])

  const groups = useMemo(
    () => memoryTagGroups(memory, state.tagCategories),
    [memory, state.tagCategories]
  )

  const emoji = memory.pinEmoji?.trim() || KIND_EMOJI[memory.kind]

  return (
    <div
      className="storybook-veil"
      role="dialog"
      aria-modal="true"
      aria-labelledby="storybook-veil-title"
    >
      <button
        type="button"
        className="storybook-veil-backdrop"
        aria-label="Close memory"
        onClick={onClose}
      />
      <div className="storybook-veil-panel">
        <div className="storybook-veil-ornament" aria-hidden>
          <span className="storybook-veil-sigil">✦</span>
        </div>
        <button
          type="button"
          className="storybook-veil-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <p className="storybook-veil-kind">
          <span className="storybook-veil-emoji" aria-hidden>
            {emoji}
          </span>
          {KIND_LABEL[memory.kind]}
        </p>
        <h2 id="storybook-veil-title" className="storybook-veil-title">
          {memory.title}
        </h2>
        <p className="storybook-veil-meta">
          <time dateTime={memory.visitedAt}>
            {new Date(memory.visitedAt).toLocaleDateString(undefined, {
              dateStyle: 'long',
            })}
          </time>
          <span className="storybook-veil-meta-sep" aria-hidden>
            ·
          </span>
          <span>{placeName}</span>
        </p>

        {rows.length > 0 ? (
          <div className="storybook-veil-photos">
            <div className="storybook-veil-photo-frame">
              <PhotoThumb row={rows[photoIdx]!} />
            </div>
            {rows.length > 1 ? (
              <div className="storybook-photo-dots" aria-hidden>
                {rows.map((r, i) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`storybook-photo-dot${i === photoIdx ? ' storybook-photo-dot--on' : ''}`}
                    onClick={() => setPhotoIdx(i)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {memory.body ? (
          <div className="storybook-veil-body">{memory.body}</div>
        ) : (
          <p className="storybook-veil-empty">No written note for this moment.</p>
        )}

        {groups.length > 0 ? (
          <div className="storybook-veil-tags">
            {groups.map((g) => (
              <div key={g.categoryLabel} className="storybook-veil-tag-group">
                <span className="storybook-veil-tag-cat">{g.categoryLabel}</span>
                <ul className="storybook-veil-tag-list">
                  {g.tags.map((t) => (
                    <li key={t} className="storybook-veil-tag-pill">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}

      </div>
    </div>
  )
}

function MomentTeaser({
  memory,
  placeName,
  onOpen,
}: {
  memory: Memory
  placeName: string
  onOpen: () => void
}) {
  const emoji = memory.pinEmoji?.trim() || KIND_EMOJI[memory.kind]

  return (
    <article className="storybook-mystic-moment">
      <button
        type="button"
        className="storybook-mystic-moment__hit"
        onClick={onOpen}
      >
        <span className="storybook-mystic-moment__kind" aria-hidden>
          {emoji} {KIND_LABEL[memory.kind]}
        </span>
        <span className="storybook-mystic-moment__place">{placeName}</span>
        {memory.body ? (
          <p className="storybook-mystic-moment__body">{memory.body}</p>
        ) : (
          <p className="storybook-mystic-moment__body storybook-mystic-moment__body--muted">
            No note yet.
          </p>
        )}
        <span className="storybook-mystic-moment__hint">Open</span>
      </button>
    </article>
  )
}

export function StorybookTourView({
  steps,
  onDone,
}: {
  steps: StorybookTourStep[]
  onDone: () => void
}) {
  const [phase, setPhase] = useState<'intro' | 'slides'>('intro')
  const [slide, setSlide] = useState(0)
  const [mapFollow, setMapFollow] = useState(true)
  const [detailMemory, setDetailMemory] = useState<Memory | null>(null)
  const [detailPlace, setDetailPlace] = useState('')

  const linePositions = useMemo(
    () => steps.map((s) => [s.lat, s.lng] as [number, number]),
    [steps]
  )

  const mapCenter = useMemo((): [number, number] => {
    if (steps.length === 0) return [20, 0]
    const lat = steps.reduce((a, s) => a + s.lat, 0) / steps.length
    const lng = steps.reduce((a, s) => a + s.lng, 0) / steps.length
    return [lat, lng]
  }, [steps])

  useEffect(() => {
    const t = window.setTimeout(() => setPhase('slides'), 2800)
    return () => window.clearTimeout(t)
  }, [])

  const go = useCallback(
    (d: number) => {
      setSlide((s) => Math.max(0, Math.min(steps.length - 1, s + d)))
    },
    [steps.length]
  )

  useEffect(() => {
    if (phase !== 'slides') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (detailMemory) {
          setDetailMemory(null)
          return
        }
        onDone()
        return
      }
      if (detailMemory) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, go, onDone, detailMemory])

  const step = steps[slide]
  const memoryIds = step ? [step.memory.id] : []
  const showDotNav = steps.length <= 28

  const openDetail = useCallback((m: Memory, place: string) => {
    setDetailMemory(m)
    setDetailPlace(place)
  }, [])

  return (
    <div className="storybook-overlay" role="dialog" aria-modal="true">
      <div className="storybook-cosmos" aria-hidden>
        <div className="storybook-cosmos-glow" />
        <div className="storybook-stars storybook-stars--far" />
        <div className="storybook-stars storybook-stars--near" />
        <div className="storybook-mist" />
        <div className="storybook-moon" />
      </div>

      {phase === 'intro' ? (
        <div className="storybook-intro">
          <div className="storybook-intro-card">
            <p className="storybook-intro-sigil" aria-hidden>
              ✦
            </p>
            <h1 className="storybook-intro-title">Storybook</h1>
            <p className="storybook-intro-epigraph">Once upon your travels…</p>
          </div>
        </div>
      ) : (
        <div className="storybook-slides storybook-slides--split">
          <button
            type="button"
            className="storybook-exit"
            onClick={onDone}
            aria-label="Exit story"
          >
            ×
          </button>

          <div className="storybook-map-shell">
            <MapContainer
              center={mapCenter}
              zoom={4}
              className="storybook-leaflet"
              style={{ width: '100%', height: '100%' }}
              scrollWheelZoom
            >
              <ZoomControl position="bottomright" />
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
                maxZoom={20}
              />
              {linePositions.length >= 2 ? (
                <Polyline
                  positions={linePositions}
                  pathOptions={{
                    color: '#c9a227',
                    weight: 3,
                    opacity: 0.75,
                    dashArray: '10 12',
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              ) : null}
              {steps.map((s, i) => (
                <Marker
                  key={s.memory.id}
                  position={[s.lat, s.lng]}
                  icon={storybookStepIcon(i, i === slide)}
                  eventHandlers={{
                    click: () => setSlide(i),
                  }}
                />
              ))}
              <StorybookFlyTo
                steps={steps}
                slide={slide}
                enabled={mapFollow}
              />
              <MapInvalidateAfterPaint />
              <MapInvalidateOnResize />
            </MapContainer>
          </div>

          <div className="storybook-slide-panel">
            {step ? (
              <div className="storybook-slide" key={step.memory.id}>
                <header className="storybook-slide-head">
                  <p className="storybook-slide-trip">{step.tripName}</p>
                  <h2 className="storybook-slide-moment-title">
                    {step.memory.title}
                  </h2>
                  <p className="storybook-slide-place-context">
                    <time dateTime={step.memory.visitedAt}>
                      {new Date(step.memory.visitedAt).toLocaleDateString(
                        undefined,
                        { dateStyle: 'medium' }
                      )}
                    </time>
                    <span className="storybook-slide-place-sep">·</span>
                    {step.placeName}
                  </p>
                </header>

                <SlidePhotos memoryIds={memoryIds} />

                <MomentTeaser
                  memory={step.memory}
                  placeName={step.placeName}
                  onOpen={() => openDetail(step.memory, step.placeName)}
                />

                <div
                  className="storybook-progress"
                  role="progressbar"
                  aria-valuemin={1}
                  aria-valuemax={steps.length}
                  aria-valuenow={slide + 1}
                  aria-label="Position in story"
                >
                  <div
                    className="storybook-progress-fill"
                    style={{
                      width: `${((slide + 1) / steps.length) * 100}%`,
                    }}
                  />
                </div>

                <label className="storybook-map-follow">
                  <input
                    type="checkbox"
                    checked={mapFollow}
                    onChange={(e) => setMapFollow(e.target.checked)}
                  />
                  Map follows each moment
                </label>

                <nav className="storybook-nav" aria-label="Tour">
                  <button
                    type="button"
                    className="storybook-nav-btn"
                    disabled={slide <= 0}
                    onClick={() => go(-1)}
                  >
                    ←
                  </button>
                  {showDotNav ? (
                    <div className="storybook-dots">
                      {steps.map((s, i) => (
                        <button
                          key={s.memory.id}
                          type="button"
                          className={`storybook-dot${i === slide ? ' storybook-dot--on' : ''}`}
                          aria-label={`Moment ${i + 1}`}
                          onClick={() => setSlide(i)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="storybook-chapter-mark" aria-live="polite">
                      <span className="storybook-chapter-glyph" aria-hidden>
                        ✧
                      </span>
                      {slide + 1} / {steps.length}
                      <span className="storybook-chapter-glyph" aria-hidden>
                        ✧
                      </span>
                    </p>
                  )}
                  <button
                    type="button"
                    className="storybook-nav-btn"
                    disabled={slide >= steps.length - 1}
                    onClick={() => go(1)}
                  >
                    →
                  </button>
                </nav>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {detailMemory ? (
        <StorybookMemoryVeil
          memory={detailMemory}
          placeName={detailPlace}
          onClose={() => setDetailMemory(null)}
        />
      ) : null}
    </div>
  )
}
