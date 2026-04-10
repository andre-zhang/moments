import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Memory, MemoryKind } from '../types'
import { AIRCRAFT_TYPES, CABIN_CLASSES } from '../data/aircraftTypes'
import { lookupIata } from '../data/iataAirports'
import { deleteAllPhotosForMemory } from '../db/photosDb'
import { datetimeLocalToIso, isoToDatetimeLocal } from '../lib/dateLocal'
import {
  joinDurationMinutes,
  splitDurationMinutes,
} from '../lib/flightDuration'
import { friendChipStyle } from '../lib/chipStyles'
import { playSaveChirp } from '../lib/saveSound'
import { photonReverse } from '../lib/photon'
import { sortTripsForDisplay } from '../lib/tripless'
import { EmojiPicker } from './EmojiPicker'
import { PhotoUploader } from './PhotoUploader'
import { LocationMapPicker } from './LocationMapPicker'
import { PlaceSearch } from './PlaceSearch'
import { SelectWithPlus } from './SelectWithPlus'
import { SelectionChipPicker } from './SelectionChipPicker'
import { StarRatingInput } from './StarRatingInput'
import { TagChipPicker } from './TagChipPicker'
import { selectionListAppliesTo } from '../whimsy/selectionLists'
import { useTravel } from '../store/travelStore'

function hotelNightsBetween(
  checkIn: string,
  checkOut: string
): number | undefined {
  if (!checkIn || !checkOut) return undefined
  const a = new Date(checkIn).getTime()
  const b = new Date(checkOut).getTime()
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return undefined
  return Math.round((b - a) / 86_400_000)
}

export function MomentForm({
  editId,
  onSuccess,
  onCancel,
}: {
  editId: string | null
  onSuccess: () => void
  onCancel?: () => void
}) {
  const draftMemoryId = useMemo(() => `m-${crypto.randomUUID()}`, [])
  const photoMemoryId = editId ?? draftMemoryId

  const { state, addMemory, updateMemory } = useTravel()

  const sortedTrips = useMemo(
    () => sortTripsForDisplay(state.trips),
    [state.trips]
  )

  const [kind, setKind] = useState<MemoryKind>('restaurant')
  const [title, setTitle] = useState('')
  const [placeLabel, setPlaceLabel] = useState('')
  const [placeQuery, setPlaceQuery] = useState('')
  const [body, setBody] = useState('')
  const [pinLat, setPinLat] = useState(48.8566)
  const [pinLng, setPinLng] = useState(2.3522)
  const [mapFocusKey, setMapFocusKey] = useState(0)
  const [countryCode, setCountryCode] = useState('FR')
  const [adminRegion, setAdminRegion] = useState('')
  const [wouldAgain, setWouldAgain] = useState(true)
  const [visitedLocal, setVisitedLocal] = useState('')
  const [tripId, setTripId] = useState('')
  const [destinationId, setDestinationId] = useState('')
  const [categoryTags, setCategoryTags] = useState<Record<string, string[]>>(
    {}
  )
  const [selectionListValues, setSelectionListValues] = useState<
    Record<string, string>
  >({})
  const [friendIds, setFriendIds] = useState<string[]>([])
  const [pinEmoji, setPinEmoji] = useState<string | undefined>(undefined)

  const [flightAirline, setFlightAirline] = useState('')
  const [flightFromCode, setFlightFromCode] = useState('')
  const [flightToCode, setFlightToCode] = useState('')
  const [flightAircraft, setFlightAircraft] = useState('')
  const [flightCabin, setFlightCabin] = useState('')
  const [flightHours, setFlightHours] = useState('')
  const [flightMinutes, setFlightMinutes] = useState('')
  const [flightConfirmation, setFlightConfirmation] = useState('')

  const [hotelBrand, setHotelBrand] = useState('')
  const [hotelCheckIn, setHotelCheckIn] = useState('')
  const [hotelCheckOut, setHotelCheckOut] = useState('')
  const [hotelStars, setHotelStars] = useState('')
  const [hotelRoomType, setHotelRoomType] = useState('')

  const [restaurantVenueStyle, setRestaurantVenueStyle] = useState('')
  const [restaurantRating, setRestaurantRating] = useState('')

  const [sightVenueType, setSightVenueType] = useState('')
  const [sightHighlights, setSightHighlights] = useState('')
  const [noteTopic, setNoteTopic] = useState('')

  const destsForTrip = useMemo(() => {
    if (!tripId) return state.destinations
    return state.destinations.filter((d) => d.tripId === tripId)
  }, [state.destinations, tripId])

  const reverseGeoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (reverseGeoTimer.current) clearTimeout(reverseGeoTimer.current)
    reverseGeoTimer.current = setTimeout(() => {
      void photonReverse(pinLat, pinLng).then((hit) => {
        if (!hit) return
        if (hit.countryCode) setCountryCode(hit.countryCode)
        if (hit.state != null) setAdminRegion(hit.state)
      })
    }, 450)
    return () => {
      if (reverseGeoTimer.current) clearTimeout(reverseGeoTimer.current)
    }
  }, [pinLat, pinLng])

  useEffect(() => {
    setCategoryTags((prev) => {
      const next = { ...prev }
      for (const id of Object.keys(next)) {
        const cat = state.tagCategories.find((c) => c.id === id)
        if (
          cat?.appliesToKinds?.length &&
          !cat.appliesToKinds.includes(kind)
        ) {
          delete next[id]
        }
      }
      return next
    })
    setSelectionListValues((prev) => {
      const next = { ...prev }
      for (const k of Object.keys(next)) {
        const list = state.selectionLists.find((l) => l.id === k)
        if (!list || !selectionListAppliesTo(list, kind)) delete next[k]
      }
      return next
    })
  }, [kind, state.tagCategories, state.selectionLists])

  useEffect(() => {
    if (!editId) {
      const t =
        state.selectedTripId &&
        sortedTrips.some((x) => x.id === state.selectedTripId)
          ? state.selectedTripId
          : sortedTrips[0]?.id ?? ''
      setTripId(t)
      const d = state.destinations.find((x) => x.tripId === t)?.id ?? ''
      setDestinationId(d)
      setVisitedLocal(isoToDatetimeLocal(new Date().toISOString()))
      setFlightAirline('')
      setFlightFromCode('')
      setFlightToCode('')
      setFlightAircraft('')
      setFlightCabin('')
      setFlightHours('')
      setFlightMinutes('')
      setFlightConfirmation('')
      setHotelBrand('')
      setHotelCheckIn('')
      setHotelCheckOut('')
      setHotelStars('')
      setHotelRoomType('')
      setRestaurantVenueStyle('')
      setRestaurantRating('')
      setSelectionListValues({})
      setSightVenueType('')
      setSightHighlights('')
      setNoteTopic('')
      return
    }
    const m = state.memories.find((x) => x.id === editId)
    if (!m) return
    setKind(m.kind)
    setTitle(m.title)
    setPlaceLabel(m.placeLabel ?? '')
    setPlaceQuery(m.placeLabel ?? m.title)
    setBody(m.body ?? '')
    setPinLat(m.lat)
    setPinLng(m.lng)
    setCountryCode(m.countryCode ?? '')
    setAdminRegion(m.adminRegion ?? '')
    setWouldAgain(m.restaurantDetails?.wouldEatAgain !== false)
    setTripId(m.tripId)
    setDestinationId(m.destinationId)
    setCategoryTags(m.categoryTags ? { ...m.categoryTags } : {})
    const sl = { ...(m.selectionListValues ?? {}) }
    if (
      m.kind === 'restaurant' &&
      m.restaurantDetails?.cuisine &&
      !sl.cuisine
    ) {
      sl.cuisine = m.restaurantDetails.cuisine
    }
    setSelectionListValues(sl)
    setFriendIds(m.friendIds ? [...m.friendIds] : [])
    setPinEmoji(m.pinEmoji)
    setVisitedLocal(isoToDatetimeLocal(m.visitedAt))

    const f = m.flightDetails
    setFlightAirline(f?.airline ?? '')
    setFlightFromCode(f?.fromCode ?? '')
    setFlightToCode(f?.toCode ?? '')
    setFlightAircraft(f?.aircraftType ?? '')
    setFlightCabin(f?.cabinClass ?? '')
    const { hours, minutes } = splitDurationMinutes(f?.durationMinutes)
    setFlightHours(hours)
    setFlightMinutes(minutes)
    setFlightConfirmation(f?.confirmationCode ?? '')

    const h = m.hotelDetails
    setHotelBrand(h?.brand ?? '')
    setHotelCheckIn(h?.checkIn ?? '')
    setHotelCheckOut(h?.checkOut ?? '')
    setHotelStars(h?.stars != null ? String(h.stars) : '')
    setHotelRoomType(h?.roomType ?? '')

    setRestaurantVenueStyle(m.restaurantDetails?.venueStyle ?? '')
    setRestaurantRating(
      m.restaurantDetails?.rating != null
        ? String(Math.round(m.restaurantDetails.rating))
        : ''
    )
    setSightVenueType(m.sightDetails?.venueType ?? '')
    setSightHighlights(m.sightDetails?.highlights ?? '')
    setNoteTopic(m.noteDetails?.topic ?? '')
    setMapFocusKey((k) => k + 1)
  }, [editId, state.memories, state.selectedTripId, sortedTrips, state.destinations])

  useEffect(() => {
    if (editId) return
    if (!destsForTrip.some((d) => d.id === destinationId)) {
      setDestinationId(destsForTrip[0]?.id ?? '')
    }
  }, [editId, destsForTrip, destinationId])

  const toggleFriend = (id: string) => {
    setFriendIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 8) return prev
      return [...prev, id]
    })
  }

  const setCat = (id: string, tags: string[]) => {
    setCategoryTags((prev) => ({ ...prev, [id]: tags }))
  }

  const handleCancel = () => {
    if (!editId) void deleteAllPhotosForMemory(draftMemoryId)
    onCancel?.()
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (state.trips.length === 0) return
    if (!tripId || !destinationId || !title.trim()) return

    const id = editId ?? draftMemoryId
    const prev = editId ? state.memories.find((x) => x.id === editId) : undefined

    let flightDetails: Memory['flightDetails'] = undefined
    if (kind === 'flight') {
      const pd = prev?.flightDetails
      const emptyTime = !flightHours.trim() && !flightMinutes.trim()
      const dur = emptyTime
        ? undefined
        : joinDurationMinutes(flightHours, flightMinutes) ?? pd?.durationMinutes
      const fc = flightFromCode.trim().toUpperCase()
      const tc = flightToCode.trim().toUpperCase()
      const fromL = fc ? lookupIata(fc) : null
      const toL = tc ? lookupIata(tc) : null
      flightDetails = {
        ...pd,
        fromCode: fc || undefined,
        toCode: tc || undefined,
        airline: flightAirline.trim() || undefined,
        aircraftType: flightAircraft || undefined,
        cabinClass: flightCabin || undefined,
        durationMinutes: dur,
        confirmationCode: flightConfirmation.trim() || undefined,
        fromLat: fc ? (fromL?.lat ?? pd?.fromLat) : undefined,
        fromLng: fc ? (fromL?.lng ?? pd?.fromLng) : undefined,
        toLat: tc ? (toL?.lat ?? pd?.toLat) : undefined,
        toLng: tc ? (toL?.lng ?? pd?.toLng) : undefined,
      }
    }

    let hotelDetails: Memory['hotelDetails'] = undefined
    if (kind === 'hotel') {
      const pd = prev?.hotelDetails
      const nights = hotelNightsBetween(hotelCheckIn, hotelCheckOut)
      const st = hotelStars.trim()
      const sn = st ? parseInt(st, 10) : NaN
      const starsOk = Number.isFinite(sn) && sn >= 1 && sn <= 5
      hotelDetails = {
        ...pd,
        brand: hotelBrand.trim() || undefined,
        checkIn: hotelCheckIn || undefined,
        checkOut: hotelCheckOut || undefined,
        nights: nights ?? pd?.nights,
        roomType: hotelRoomType.trim() || undefined,
        stars: st ? (starsOk ? sn : pd?.stars) : undefined,
      }
    }

    let restaurantDetails: Memory['restaurantDetails'] = undefined
    if (kind === 'restaurant') {
      const pd = prev?.restaurantDetails
      const r = restaurantRating.trim()
      const rt = r ? Math.round(parseFloat(r)) : NaN
      const cuisinePick = selectionListValues['cuisine']?.trim()
      restaurantDetails = {
        ...pd,
        wouldEatAgain: wouldAgain,
        rating: Number.isFinite(rt) && rt >= 1 && rt <= 5 ? rt : pd?.rating,
        venueStyle: restaurantVenueStyle.trim() || undefined,
        cuisine: cuisinePick || undefined,
      }
    }

    let sightDetails: Memory['sightDetails'] = undefined
    if (kind === 'sight') {
      sightDetails = {
        ...prev?.sightDetails,
        venueType: sightVenueType.trim() || undefined,
        highlights: sightHighlights.trim() || undefined,
      }
    }

    let noteDetails: Memory['noteDetails'] = undefined
    if (kind === 'note') {
      noteDetails = {
        ...prev?.noteDetails,
        topic: noteTopic.trim() || undefined,
      }
    }

    const selClean: Record<string, string> = {}
    for (const [k, v] of Object.entries(selectionListValues)) {
      if (v) selClean[k] = v
    }

    const memory: Memory = {
      id,
      tripId,
      destinationId,
      kind,
      title: title.trim(),
      placeLabel: placeLabel.trim() || undefined,
      body: body.trim() || undefined,
      lat: pinLat,
      lng: pinLng,
      visitedAt: datetimeLocalToIso(visitedLocal),
      pinEmoji: pinEmoji?.trim() || undefined,
      countryCode: countryCode.trim().toUpperCase() || undefined,
      adminRegion: adminRegion.trim() || undefined,
      flightDetails,
      hotelDetails,
      restaurantDetails,
      sightDetails,
      noteDetails,
      categoryTags: Object.keys(categoryTags).some(
        (k) => categoryTags[k]?.length
      )
        ? { ...categoryTags }
        : undefined,
      selectionListValues:
        Object.keys(selClean).length > 0 ? selClean : undefined,
      friendIds: friendIds.length ? friendIds : undefined,
    }

    if (editId) updateMemory(memory)
    else addMemory(memory)

    if (state.uiSoundEnabled) playSaveChirp()
    onSuccess()
  }

  return (
    <form className="moment-form" onSubmit={submit}>
      <header className="page-header">
        <h1>{editId ? 'Edit moment' : 'New moment'}</h1>
        {onCancel ? (
          <button type="button" className="link-quiet" onClick={handleCancel}>
            Cancel
          </button>
        ) : (
          <Link to="/add" className="link-quiet">
            Back
          </Link>
        )}
      </header>

      {state.trips.length === 0 ? (
        <p className="form-hint">
          Add a trip under <Link to="/places">Places</Link> first.
        </p>
      ) : null}

      <section className="form-section">
        <label>
          Trip
          <SelectWithPlus>
            <select
              value={tripId}
              onChange={(e) => {
                setTripId(e.target.value)
                const first = state.destinations.find(
                  (d) => d.tripId === e.target.value
                )
                setDestinationId(first?.id ?? '')
              }}
              disabled={state.trips.length === 0}
            >
              {sortedTrips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </SelectWithPlus>
        </label>

        <label>
          Destination
          <select
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
          >
            {destsForTrip.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Kind
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as MemoryKind)}
          >
            <option value="restaurant">Restaurant</option>
            <option value="hotel">Hotel</option>
            <option value="flight">Flight</option>
            <option value="sight">Sight</option>
            <option value="note">Note</option>
          </select>
        </label>

        <label>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <PlaceSearch
          value={placeQuery}
          onChange={setPlaceQuery}
          onGeocodePreview={(h) => {
            if (!h) return
            setPinLat(h.lat)
            setPinLng(h.lng)
            if (h.countryCode) setCountryCode(h.countryCode)
            if (h.state) setAdminRegion(h.state)
            setMapFocusKey((k) => k + 1)
          }}
          onPick={(h) => {
            setPinLat(h.lat)
            setPinLng(h.lng)
            setPlaceLabel(h.label)
            setPlaceQuery(h.label)
            if (h.countryCode) setCountryCode(h.countryCode)
            if (h.state) setAdminRegion(h.state)
            setMapFocusKey((k) => k + 1)
          }}
        />
      </section>

      <section className="form-section">
        <h2 className="form-section-title">When</h2>
        <label>
          Date &amp; time
          <input
            type="datetime-local"
            value={visitedLocal}
            onChange={(e) => setVisitedLocal(e.target.value)}
            required
          />
        </label>
      </section>

      <section className="form-section">
        <h2 className="form-section-title">Location on map</h2>
        <p className="form-hint location-map-hint">
          Drag the pin or click the map to set where this moment happened. Search
          above jumps the pin; country and region update from the pin automatically.
        </p>
        <LocationMapPicker
          lat={pinLat}
          lng={pinLng}
          focusKey={mapFocusKey}
          mapKey={photoMemoryId}
          onChange={(la, ln) => {
            setPinLat(la)
            setPinLng(ln)
          }}
        />
      </section>

      <section className="form-section">
        <h2 className="form-section-title">Photos</h2>
        <PhotoUploader memoryId={photoMemoryId} />
      </section>

      {kind === 'restaurant' ? (
        <section className="form-section">
          <StarRatingInput
            label="Rating"
            value={
              restaurantRating.trim() === ''
                ? ''
                : Number(restaurantRating)
            }
            onChange={(n) =>
              setRestaurantRating(n === '' ? '' : String(n))
            }
          />
        </section>
      ) : null}

      {kind === 'hotel' ? (
        <section className="form-section">
          <StarRatingInput
            label="Stars"
            value={hotelStars.trim() === '' ? '' : Number(hotelStars)}
            onChange={(n) => setHotelStars(n === '' ? '' : String(n))}
          />
        </section>
      ) : null}

      <fieldset className="tags-fieldset">
          <legend>Tags</legend>
          {state.tagCategories
            .filter((cat) => {
              if (!cat.appliesToKinds?.length) return true
              return cat.appliesToKinds.includes(kind)
            })
            .map((cat) => (
              <TagChipPicker
                key={cat.id}
                category={cat}
                selected={categoryTags[cat.id] ?? []}
                onChange={(tags) => setCat(cat.id, tags)}
              />
            ))}
          {state.selectionLists.some((l) =>
            selectionListAppliesTo(l, kind)
          ) ? (
            <div className="selection-lists-in-form">
              {state.selectionLists
                .filter((l) => selectionListAppliesTo(l, kind))
                .map((list) => (
                  <SelectionChipPicker
                    key={list.id}
                    list={list}
                    value={selectionListValues[list.id] ?? ''}
                    onChange={(v) =>
                      setSelectionListValues((p) => ({ ...p, [list.id]: v }))
                    }
                  />
                ))}
            </div>
          ) : null}
      </fieldset>

      <details className="moment-form-more">
        <summary className="moment-form-more-summary">Add more</summary>
        <div className="moment-form-more-body">
          <section className="moment-form-more-section">
            <h3 className="moment-form-more-heading">Place label &amp; pin</h3>
            <p className="moment-form-more-lede">
              Optional caption and custom emoji for the map. Photos are above in{' '}
              <strong>Photos</strong>.
            </p>
            <label>
              Place label
              <input
                value={placeLabel}
                onChange={(e) => setPlaceLabel(e.target.value)}
                placeholder="e.g. Café name, terminal, trailhead"
              />
            </label>
            <EmojiPicker value={pinEmoji} onChange={setPinEmoji} />
          </section>

          <section className="moment-form-more-section">
            <h3 className="moment-form-more-heading">
              {kind === 'note' ? 'Body' : 'Notes'}
            </h3>
            <label className="label-block-full">
              <span className="moment-form-more-field-label">
                {kind === 'note' ? 'Full text' : 'What happened?'}
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder="Stories, orders, impressions…"
              />
            </label>
            {kind === 'restaurant' ? (
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={wouldAgain}
                  onChange={(e) => setWouldAgain(e.target.checked)}
                />
                Would eat again
              </label>
            ) : null}
          </section>

          {kind === 'flight' ? (
            <section className="form-section form-section--nested">
              <h3 className="form-section-title">Flight</h3>
              <label>
                Airline
                <input
                  value={flightAirline}
                  onChange={(e) => setFlightAirline(e.target.value)}
                  placeholder="e.g. United"
                />
              </label>
              <div className="row-2">
                <label>
                  From (IATA)
                  <input
                    value={flightFromCode}
                    onChange={(e) => setFlightFromCode(e.target.value)}
                    maxLength={4}
                    placeholder="JFK"
                  />
                </label>
                <label>
                  To (IATA)
                  <input
                    value={flightToCode}
                    onChange={(e) => setFlightToCode(e.target.value)}
                    maxLength={4}
                    placeholder="LHR"
                  />
                </label>
              </div>
              <label>
                Aircraft
                <select
                  value={flightAircraft}
                  onChange={(e) => setFlightAircraft(e.target.value)}
                >
                  {AIRCRAFT_TYPES.map((a) => (
                    <option key={`ac-${a.value || 'x'}`} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Class of service
                <select
                  value={flightCabin}
                  onChange={(e) => setFlightCabin(e.target.value)}
                >
                  {CABIN_CLASSES.map((c) => (
                    <option key={`cab-${c.value || 'x'}`} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="row-2">
                <label>
                  Hours
                  <input
                    type="number"
                    min={0}
                    value={flightHours}
                    onChange={(e) => setFlightHours(e.target.value)}
                    placeholder="0"
                  />
                </label>
                <label>
                  Minutes
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={flightMinutes}
                    onChange={(e) => setFlightMinutes(e.target.value)}
                    placeholder="0"
                  />
                </label>
              </div>
              <label>
                Record locator
                <input
                  value={flightConfirmation}
                  onChange={(e) => setFlightConfirmation(e.target.value)}
                  placeholder="PNR"
                />
              </label>
            </section>
          ) : null}

          {kind === 'hotel' ? (
            <section className="form-section form-section--nested">
              <h3 className="form-section-title">Hotel</h3>
              <label>
                Brand / chain
                <input
                  value={hotelBrand}
                  onChange={(e) => setHotelBrand(e.target.value)}
                  placeholder="e.g. Marriott"
                />
              </label>
              <div className="row-2">
                <label>
                  Check-in
                  <input
                    type="date"
                    value={hotelCheckIn}
                    onChange={(e) => setHotelCheckIn(e.target.value)}
                  />
                </label>
                <label>
                  Check-out
                  <input
                    type="date"
                    value={hotelCheckOut}
                    onChange={(e) => setHotelCheckOut(e.target.value)}
                  />
                </label>
              </div>
              <label>
                Room type
                <input
                  value={hotelRoomType}
                  onChange={(e) => setHotelRoomType(e.target.value)}
                  placeholder="e.g. King, suite"
                />
              </label>
            </section>
          ) : null}

          {kind === 'restaurant' ? (
            <section className="form-section form-section--nested">
              <h3 className="form-section-title">Restaurant</h3>
              <label>
                Style / chain
                <input
                  value={restaurantVenueStyle}
                  onChange={(e) => setRestaurantVenueStyle(e.target.value)}
                />
              </label>
            </section>
          ) : null}

          {kind === 'sight' ? (
            <section className="form-section form-section--nested">
              <h3 className="form-section-title">Sight</h3>
              <label>
                Type
                <input
                  value={sightVenueType}
                  onChange={(e) => setSightVenueType(e.target.value)}
                />
              </label>
              <label className="label-block-full">
                Highlights
                <textarea
                  value={sightHighlights}
                  onChange={(e) => setSightHighlights(e.target.value)}
                  rows={2}
                />
              </label>
            </section>
          ) : null}

          {kind === 'note' ? (
            <section className="form-section form-section--nested">
              <h3 className="form-section-title">Note</h3>
              <label>
                Topic
                <input
                  value={noteTopic}
                  onChange={(e) => setNoteTopic(e.target.value)}
                />
              </label>
            </section>
          ) : null}

          <fieldset className="tags-fieldset moment-form-more-section moment-form-more-section--people">
            <legend className="moment-form-more-fieldset-legend">People on this moment</legend>
            {state.friends.length === 0 ? (
              <p className="form-hint">
                Add people under <Link to="/places">Places</Link>.
              </p>
            ) : (
              <div
                className="friend-chip-row"
                role="group"
                aria-label="Friends on this moment"
              >
                {state.friends.map((f) => {
                  const on = friendIds.includes(f.id)
                  return (
                    <button
                      key={f.id}
                      type="button"
                      className={`friend-chip${on ? ' friend-chip--on' : ''}`}
                      style={friendChipStyle(f)}
                      onClick={() => toggleFriend(f.id)}
                    >
                      {f.name}
                    </button>
                  )
                })}
              </div>
            )}
          </fieldset>
        </div>
      </details>

      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary"
          disabled={state.trips.length === 0}
        >
          {editId ? 'Save' : 'Save moment'}
        </button>
        {onCancel ? (
          <button type="button" className="btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}
