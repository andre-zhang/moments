import { useMemo, useEffect, useState } from 'react'
import { DiscoverPanel } from '../components/DiscoverPanel'
import { PageHeader } from '../components/PageHeader'
import { PassportCurateBar } from '../components/PassportCurateBar'
import { getPageMasthead } from '../lib/demoSamplePhotos'
import {
  PASSPORT_VIEW_STORAGE_KEY,
  readPassportViewMode,
  type PassportViewMode,
} from '../lib/passportViewMode'
import { useTravel } from '../store/travelStore'

export function PassportPage() {
  const { state } = useTravel()
  const stampy = state.memories.length > 0

  const [viewMode, setViewMode] = useState<PassportViewMode>(() =>
    readPassportViewMode()
  )

  useEffect(() => {
    try {
      localStorage.setItem(PASSPORT_VIEW_STORAGE_KEY, viewMode)
    } catch {
      /* ignore */
    }
  }, [viewMode])

  const book = viewMode === 'book'

  const bookBanner = useMemo(() => getPageMasthead('passport-book', 'passport'), [])
  const simpleBanner = useMemo(() => getPageMasthead('passport-simple', 'passport'), [])

  const viewToggleInner = (
    <>
      <span className="passport-view-toggle-label" id="passport-view-label">
        View
      </span>
      <div
        className="passport-view-toggle-seg"
        role="radiogroup"
        aria-labelledby="passport-view-label"
      >
        <button
          type="button"
          role="radio"
          aria-checked={book}
          className={`passport-view-btn${book ? ' passport-view-btn--on' : ''}`}
          onClick={() => setViewMode('book')}
        >
          Stamp book
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={!book}
          className={`passport-view-btn${!book ? ' passport-view-btn--on' : ''}`}
          onClick={() => setViewMode('simple')}
        >
          Simple
        </button>
      </div>
    </>
  )

  const viewToggleToolbar = (
    <div
      className="passport-view-toggle passport-view-toggle--toolbar"
      role="group"
      aria-label="Passport display"
    >
      {viewToggleInner}
    </div>
  )

  const subtitle = (
    <>
      {stampy ? (
        <p className="passport-stat passport-stat--page-header">
          <span className="passport-stat-num">{state.memories.length}</span>
          <span className="passport-stat-label">
            moment{state.memories.length === 1 ? '' : 's'} documented
          </span>
        </p>
      ) : (
        <p className="passport-stat passport-stat--empty passport-stat--page-header">
          Your story begins with the first moment.
        </p>
      )}
      <PassportCurateBar />
    </>
  )

  return (
    <div
      className={`page passport-page${book ? ' passport-page--book' : ' passport-page--simple'}`}
    >
      <PageHeader
        title={
          book ? (
            <span className="passport-title passport-title--banner">Passport</span>
          ) : (
            'Passport'
          )
        }
        preTitle={
          book ? (
            <p className="passport-kicker passport-kicker--banner">Official travel record</p>
          ) : undefined
        }
        toolbarBelow
        banner={book ? bookBanner : simpleBanner}
        subtitle={subtitle}
        actions={viewToggleToolbar}
      />
      <DiscoverPanel memories={state.memories} viewMode={viewMode} />
    </div>
  )
}
