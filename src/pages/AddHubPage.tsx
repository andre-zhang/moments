import { Link, Navigate, useSearchParams } from 'react-router-dom'

export function AddHubPage() {
  const [params] = useSearchParams()
  const edit = params.get('edit')
  if (edit)
    return (
      <Navigate
        to={`/add/moment?edit=${encodeURIComponent(edit)}`}
        replace
      />
    )

  return (
    <div className="page add-hub-page">
      <header className="page-hero">
        <h1 className="page-title">Add</h1>
      </header>
      <div className="add-hub-grid">
        <Link to="/add/moment" className="add-hub-tile">
          <span className="add-hub-tile-title">Moment</span>
        </Link>
        <Link to="/places" className="add-hub-tile">
          <span className="add-hub-tile-title">Places &amp; people</span>
        </Link>
      </div>
    </div>
  )
}
