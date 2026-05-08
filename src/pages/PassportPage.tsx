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

  const viewToggleRail = (
    <div className="passport-view-toggle" role="group" aria-label="Passport display">
      {viewToggleInner}
    </div>
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

  return (
    <div
      className={`page passport-page${book ? ' passport-page--book' : ' passport-page--simple'}`}
    >
      {book ? (
        <header className="passport-hero page-hero passport-hero--book passport-hero--with-banner">
          <div
            className="passport-hero-banner-bg"
            style={{ backgroundImage: `url(${bookBanner.src})` }}
            role="img"
            aria-label={bookBanner.alt}
          />
          <div className="passport-hero-banner-scrim" aria-hidden />
          <div className="passport-hero__inner">
            <div className="passport-cover passport-cover--on-banner">
              <div className="passport-cover-top passport-cover-top--book-hero">
                <div className="passport-cover-text">
                  <p className="passport-kicker">Official travel record</p>
                  <h1 className="page-title passport-title">Passport</h1>
                  {stampy ? (
                    <p className="passport-stat">
                      <span className="passport-stat-num">{state.memories.length}</span>
                      <span className="passport-stat-label">
                        moment{state.memories.length === 1 ? '' : 's'} documented
                      </span>
                    </p>
                  ) : (
                    <p className="passport-stat passport-stat--empty">
                      Your story begins with the first moment.
                    </p>
                  )}
                  <PassportCurateBar />
                </div>
                {viewToggleRail}
              </div>
            </div>
            <p className="passport-hero-banner-caption passport-hero-banner-caption--book">
              {bookBanner.caption}
            </p>
          </div>
        </header>
      ) : (
        <PageHeader
          title="Passport"
          toolbarBelow
          banner={simpleBanner}
          subtitle={
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
          }
          actions={viewToggleToolbar}
        />
      )}
      <DiscoverPanel memories={state.memories} viewMode={viewMode} />
    </div>
  )
}
