import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StorybookTourView } from '../components/storybook/StorybookTourView'
import {
  buildStorybookSteps,
  type StorybookFilter,
  type StorybookTourStep,
} from '../lib/buildStorybookTour'
import { getPageMasthead } from '../lib/demoSamplePhotos'
import { sortTripsForDisplay, TRIPLESS_TRIP_ID } from '../lib/tripless'
import { useTravel } from '../store/travelStore'

export function StorybookPage() {
  const { state } = useTravel()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const tripFromUrl = searchParams.get('trip')
  const replayFromUrl = searchParams.get('replay') === '1'
  const replayOpened = useRef(false)

  const [mode, setMode] = useState<'trip' | 'range'>('trip')
  const [tripId, setTripId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [tour, setTour] = useState<StorybookTourStep[] | null>(null)

  const tripsPickable = useMemo(
    () => sortTripsForDisplay(state.trips).filter((t) => t.id !== TRIPLESS_TRIP_ID),
    [state.trips]
  )

  const storybookBanner = useMemo(
    () => getPageMasthead('storybook-hero', 'storybook'),
    []
  )

  useEffect(() => {
    replayOpened.current = false
  }, [location.key])

  useEffect(() => {
    if (tripFromUrl && tripsPickable.some((t) => t.id === tripFromUrl)) {
      setTripId(tripFromUrl)
      setMode('trip')
      return
    }
    if (tripId || tripsPickable.length === 0) return
    setTripId(tripsPickable[0]!.id)
  }, [tripFromUrl, tripId, tripsPickable])

  useEffect(() => {
    if (!replayFromUrl || replayOpened.current || tour != null) return
    const tid = tripFromUrl ?? tripId
    if (!tid || !tripsPickable.some((t) => t.id === tid)) return
    const steps = buildStorybookSteps(
      state.memories,
      state.destinations,
      state.trips,
      { mode: 'trip', tripId: tid }
    )
    if (steps.length === 0) return
    replayOpened.current = true
    setTour(steps)
  }, [
    replayFromUrl,
    tripFromUrl,
    tripId,
    tour,
    tripsPickable,
    state.memories,
    state.destinations,
    state.trips,
  ])

  const start = () => {
    let filter: StorybookFilter
    if (mode === 'trip') {
      if (!tripId) return
      filter = { mode: 'trip', tripId }
    } else {
      if (!from.trim() || !to.trim()) return
      filter = { mode: 'range', fromIso: from, toIso: to }
    }
    const steps = buildStorybookSteps(
      state.memories,
      state.destinations,
      state.trips,
      filter
    )
    if (steps.length === 0) {
      window.alert('No moments match.')
      return
    }
    setTour(steps)
  }

  useEffect(() => {
    if (!tour) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [tour])

  if (tour) {
    return <StorybookTourView steps={tour} onDone={() => setTour(null)} />
  }

  return (
    <div className="page storybook-picker-page">
      <PageHeader title="Storybook" banner={storybookBanner} />

      <div className="storybook-picker-card">
        <div className="storybook-mode-row">
          <label className="storybook-mode">
            <input
              type="radio"
              name="sb-mode"
              checked={mode === 'trip'}
              onChange={() => setMode('trip')}
            />
            Trip
          </label>
          <label className="storybook-mode">
            <input
              type="radio"
              name="sb-mode"
              checked={mode === 'range'}
              onChange={() => setMode('range')}
            />
            Dates
          </label>
        </div>

        {mode === 'trip' ? (
          <label className="storybook-field">
            <select
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
              disabled={tripsPickable.length === 0}
            >
              {tripsPickable.length === 0 ? (
                <option value="">—</option>
              ) : (
                tripsPickable.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))
              )}
            </select>
          </label>
        ) : (
          <div className="storybook-date-row">
            <label className="storybook-field">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>
            <label className="storybook-field">
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
          </div>
        )}

        <button
          type="button"
          className="btn-secondary storybook-start"
          onClick={start}
          disabled={
            mode === 'trip'
              ? !tripId
              : !from.trim() || !to.trim()
          }
        >
          Begin
        </button>
      </div>
    </div>
  )
}
