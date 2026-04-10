import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTravel } from '../store/travelStore'

export function AddTripPage() {
  const { addTrip, addDestination } = useTravel()
  const navigate = useNavigate()
  const [tripName, setTripName] = useState('')
  const [firstPlace, setFirstPlace] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = tripName.trim()
    if (!n) return
    const tid = `t-${crypto.randomUUID()}`
    addTrip({ id: tid, name: n })
    const place = firstPlace.trim()
    if (place) {
      addDestination({ id: `d-${crypto.randomUUID()}`, tripId: tid, name: place })
    }
    navigate('/places')
  }

  return (
    <div className="page add-trip-page">
      <header className="page-hero">
        <h1 className="page-title">New trip</h1>
      </header>
      <form className="panel-block" onSubmit={submit}>
        <label>
          Trip name
          <input
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="e.g. Kyoto spring"
            required
          />
        </label>
        <label>
          First place <span className="label-optional">(optional)</span>
          <input
            value={firstPlace}
            onChange={(e) => setFirstPlace(e.target.value)}
            placeholder="e.g. Kyoto"
          />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Create trip
          </button>
          <Link to="/add" className="btn-secondary">
            Back
          </Link>
        </div>
      </form>
    </div>
  )
}
