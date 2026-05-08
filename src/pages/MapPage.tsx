import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconReplay } from '../components/Icons'
import { MemoryMap } from '../components/MemoryMap'
import { PageHeader } from '../components/PageHeader'
import { SelectWithPlus } from '../components/SelectWithPlus'
import { getPageDemoBanner } from '../lib/demoSamplePhotos'
import { KIND_LABEL } from '../lib/kindMeta'
import { sortTripsForDisplay } from '../lib/tripless'
import type { MemoryKind } from '../types'
import { useTravel } from '../store/travelStore'

const ALL_KINDS: MemoryKind[] = [
  'flight',
  'hotel',
  'restaurant',
  'sight',
  'note',
]

export function MapPage() {
  const navigate = useNavigate()
  const { state, selectTrip, replayTripLines } = useTravel()

  const [kindSet, setKindSet] = useState<Set<MemoryKind>>(
    () => new Set(ALL_KINDS)
  )

  const tripMemories = useMemo(() => {
    if (!state.selectedTripId) return state.memories
    return state.memories.filter((m) => m.tripId === state.selectedTripId)
  }, [state.memories, state.selectedTripId])

  const filteredMemories = useMemo(
    () => tripMemories.filter((m) => kindSet.has(m.kind)),
    [tripMemories, kindSet]
  )

  const toggleKind = (k: MemoryKind) => {
    setKindSet((prev) => {
      const next = new Set(prev)
      if (next.has(k)) {
        next.delete(k)
        if (next.size === 0) return new Set(ALL_KINDS)
      } else {
        next.add(k)
      }
      return next
    })
  }

  const landedSet = useMemo(
    () => new Set(state.landedMemoryIds),
    [state.landedMemoryIds]
  )

  const tripsSorted = useMemo(
    () => sortTripsForDisplay(state.trips),
    [state.trips]
  )

  const mapHeroBanner = useMemo(() => getPageDemoBanner('map-hero'), [])

  const showFlightRoutes = kindSet.has('flight')

  return (
    <div className="page map-page">
      <PageHeader
        className="map-page-header"
        title="Map"
        toolbarBelow
        banner={{
          src: mapHeroBanner.src,
          caption: mapHeroBanner.caption,
          alt: mapHeroBanner.alt,
        }}
        actions={
          <div className="map-toolbar journal-toolbar">
            <div className="map-kind-filters" role="group" aria-label="Moment types">
              {ALL_KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`map-kind-chip${kindSet.has(k) ? ' map-kind-chip--on' : ''}`}
                  onClick={() => toggleKind(k)}
                >
                  {KIND_LABEL[k]}
                </button>
              ))}
            </div>
            <div className="map-trip-field">
              <label className="map-trip-field-label">
                <span>Trip line</span>
                <div className="map-trip-controls">
                  <SelectWithPlus plusAlign="left">
                    <select
                      value={state.selectedTripId ?? ''}
                      onChange={(e) =>
                        selectTrip(e.target.value ? e.target.value : null)
                      }
                      aria-label="Filter map by trip"
                    >
                      <option value="">All trips</option>
                      {tripsSorted.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </SelectWithPlus>
                  {state.selectedTripId ? (
                    <button
                      type="button"
                      className="btn-icon-square"
                      onClick={replayTripLines}
                      title="Replay route"
                    >
                      <IconReplay className="btn-icon-svg" />
                    </button>
                  ) : null}
                </div>
              </label>
            </div>
          </div>
        }
      />
      <div className="map-main">
        <div className="map-stage">
          <MemoryMap
            memories={filteredMemories}
            showTripLine={Boolean(state.selectedTripId)}
            linePlayKey={state.tripLinePlayKey}
            landedIds={landedSet}
            showFlightRoutes={showFlightRoutes}
            onSelectMemory={(m) =>
              navigate(`/moment/${encodeURIComponent(m.id)}?from=map`)
            }
          />
        </div>
      </div>
    </div>
  )
}
