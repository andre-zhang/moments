import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SelectWithPlus } from './SelectWithPlus'
import { PassportStampGlyph } from './PassportStampGlyph'
import type { Memory } from '../types'
import { KIND_EMOJI } from '../lib/kindMeta'
import type { PassportViewMode } from '../lib/passportViewMode'
import { computeModeStats, computeYearInReview } from '../lib/stats'
import {
  computeStamps,
  STAMP_GROUP_LABEL,
  STAMP_GROUP_ORDER,
  type StampGroup,
} from '../lib/stamps'

export type { PassportViewMode } from '../lib/passportViewMode'

function yearOptions(memories: Memory[]): number[] {
  const ys = new Set<number>()
  for (const m of memories) {
    const y = new Date(m.visitedAt).getFullYear()
    if (y > 1900 && y < 3000) ys.add(y)
  }
  const list = [...ys].sort((a, b) => b - a)
  if (list.length === 0) list.push(new Date().getFullYear())
  return list
}

export function DiscoverPanel({
  memories,
  viewMode,
}: {
  memories: Memory[]
  viewMode: PassportViewMode
}) {
  const years = useMemo(() => yearOptions(memories), [memories])
  const [year, setYear] = useState(() => years[0] ?? new Date().getFullYear())

  useEffect(() => {
    if (!years.includes(year)) setYear(years[0] ?? new Date().getFullYear())
  }, [years, year])

  const cards = useMemo(
    () => computeYearInReview(memories, year),
    [memories, year]
  )
  const stamps = useMemo(() => computeStamps(memories), [memories])
  const stampsByGroup = useMemo(() => {
    const m = new Map<StampGroup, typeof stamps>()
    for (const g of STAMP_GROUP_ORDER) m.set(g, [])
    for (const s of stamps) m.get(s.group)?.push(s)
    return m
  }, [stamps])
  const modeStats = useMemo(() => computeModeStats(memories), [memories])

  const book = viewMode === 'book'

  return (
    <div
      className={`discover passport-discover${book ? ' passport-discover--book' : ' passport-discover--simple'}`}
    >
      <div className="passport-spread">
        <section className="discover-section passport-pane passport-pane--year">
          <div className="passport-section-head">
            <span
              className={`passport-section-mark${book ? '' : ' passport-section-mark--plain'}`}
              aria-hidden
            />
            <h2>Year in view</h2>
          </div>
          <label className="discover-year passport-year-row">
            <span className="passport-year-label">Fiscal page</span>
            <SelectWithPlus>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                aria-label="Year for highlights"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </SelectWithPlus>
          </label>
          <div className="yir-cards">
            {cards.length === 0 ? (
              <p className="discover-muted passport-muted-box">
                {book
                  ? 'No moments in this year yet — your page awaits ink.'
                  : 'No moments in this year yet.'}
              </p>
            ) : (
              cards.map((c) => (
                <article key={c.id} className="yir-card">
                  <p className="yir-headline">{c.headline}</p>
                  {c.sub ? <p className="yir-sub">{c.sub}</p> : null}
                </article>
              ))
            )}
          </div>
        </section>

        <section className="discover-section passport-pane passport-pane--stamps">
          <div className="passport-section-head">
            <span
              className={`passport-section-mark passport-section-mark--star${book ? '' : ' passport-section-mark--plain'}`}
              aria-hidden
            />
            <h2>Stamps</h2>
          </div>
          {book ? (
            <p className="passport-pane-lede">
              A handful of highlights — your start, coverage, and where you’ve been on the map.
            </p>
          ) : null}
          {stamps.length === 0 ? (
            <p className="discover-muted passport-muted-box">
              {book
                ? 'Add moments to see your passport milestones here.'
                : 'Add moments to see trip and place summaries here.'}
            </p>
          ) : book ? (
            <div className="stamp-groups">
              {STAMP_GROUP_ORDER.map((g) => {
                const items = stampsByGroup.get(g) ?? []
                if (items.length === 0) return null
                return (
                  <section key={g} className="stamp-group" aria-label={STAMP_GROUP_LABEL[g]}>
                    <h3 className="stamp-group-title">{STAMP_GROUP_LABEL[g]}</h3>
                    <ul className="stamp-list stamp-list--book stamp-list--grid">
                      {items.map((s) => (
                        <li key={s.id} className="stamp-row stamp-row--book stamp-row--tile">
                          <div className="stamp-row-glyph" aria-hidden>
                            <PassportStampGlyph stampId={s.id} />
                          </div>
                          <div className="stamp-row-main">
                            <span className="stamp-label">{s.label}</span>
                            <span className="stamp-detail">{s.detail}</span>
                          </div>
                          <time className="stamp-date" dateTime={s.earnedAt}>
                            {new Date(s.earnedAt).toLocaleDateString(undefined, {
                              dateStyle: 'medium',
                            })}
                          </time>
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          ) : (
            <ul className="stamp-list">
              {stamps.map((s) => (
                <li key={s.id} className="stamp-row">
                  <div className="stamp-row-main">
                    <span className="stamp-label">{s.label}</span>
                    <span className="stamp-detail">{s.detail}</span>
                  </div>
                  <time className="stamp-date" dateTime={s.earnedAt}>
                    {new Date(s.earnedAt).toLocaleDateString(undefined, {
                      dateStyle: 'medium',
                    })}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="discover-section passport-pane passport-pane--visas">
        <div className="passport-section-head">
          <span
            className={`passport-section-mark passport-section-mark--grid${book ? '' : ' passport-section-mark--plain'}`}
            aria-hidden
          />
          <h2>Entries by kind</h2>
        </div>
        {book ? (
          <p className="passport-pane-lede">
            Visa-style spreads — tap a category to open your moments.
          </p>
        ) : (
          <p className="passport-pane-lede passport-pane-lede--simple">
            Open a category to browse moments and stats.
          </p>
        )}
        <div
          className={`mode-grid passport-mode-grid${book ? ' passport-mode-grid--book' : ''}`}
        >
          {modeStats.map((row) => (
            <Link
              key={row.kind}
              to={`/passport/${row.kind}`}
              className={`mode-card mode-card--link mode-card--kind-${row.kind}${book ? ' mode-card--visa' : ''}`}
            >
              {book ? (
                <span className="mode-card-visa-chip" aria-hidden>
                  VISA
                </span>
              ) : null}
              <span className="mode-card-emoji" aria-hidden>
                {KIND_EMOJI[row.kind]}
              </span>
              <span className="mode-title">{row.label}</span>
              <span className="mode-count">
                {row.count} moment{row.count === 1 ? '' : 's'}
              </span>
              <span className="mode-primary">{row.primaryLabel}</span>
              <span className="mode-value">{row.primaryValue}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
