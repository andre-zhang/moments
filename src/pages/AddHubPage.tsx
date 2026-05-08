import { useMemo } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { getPageMasthead } from '../lib/demoSamplePhotos'

export function AddHubPage() {
  const [params] = useSearchParams()
  const hubBanner = useMemo(() => getPageMasthead('add-hub-hero', 'add'), [])
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
      <PageHeader title="Add" banner={hubBanner} />
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
