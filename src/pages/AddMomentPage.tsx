import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { MomentForm } from '../components/MomentForm'
import { useTravel } from '../store/travelStore'

export function AddMomentPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const editId = params.get('edit')
  const { state } = useTravel()

  const editingMissing = Boolean(
    editId &&
      state.memories.length > 0 &&
      !state.memories.some((x) => x.id === editId)
  )

  if (editingMissing) {
    return (
      <div className="page add-page">
        <p className="form-hint">That moment could not be found.</p>
        <Link to="/" className="btn-primary">
          Back to journal
        </Link>
      </div>
    )
  }

  return (
    <div className="page add-page add-page--canvas">
      <MomentForm
        editId={editId}
        onSuccess={() => navigate('/')}
        onCancel={() => navigate('/')}
      />
    </div>
  )
}
