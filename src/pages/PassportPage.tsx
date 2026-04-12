import { useEffect, useState } from 'react'
import { DiscoverPanel } from '../components/DiscoverPanel'
import { PassportCurateBar } from '../components/PassportCurateBar'
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

  return (
    <div
      className={`page passport-page${book ? ' passport-page--book' : ' passport-page--simple'}`}
    >
      <header className="passport-hero page-hero passport-hero--book">
        <div className="passport-cover">
          <div className="passport-cover-top">
            <div className="passport-cover-text">
              {book ? <p className="passport-kicker">Official travel record</p> : null}
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
            <div className="passport-view-toggle" role="group" aria-label="Passport display">
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
            </div>
          </div>
        </div>
      </header>
      <DiscoverPanel memories={state.memories} viewMode={viewMode} />
    </div>
  )
}
