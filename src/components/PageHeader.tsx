import type { ReactNode } from 'react'

export type PageHeaderProps = {
  /** Main heading (string or fragment for rich titles, e.g. friend color bar + name). */
  title: ReactNode
  /** Breadcrumb, back link, or kicker above the title. */
  preTitle?: ReactNode
  /** Intro or stats below the title (use `className="page-subtitle"` on inner `<p>` when needed). */
  subtitle?: ReactNode
  /** Toolbar / filters — aligns to the title row on wide layouts. */
  actions?: ReactNode
  /** Extra classes on `<header>` (e.g. `places-hero`). */
  className?: string
}

/**
 * Shared page chrome: consistent spacing, type scale, and optional actions slot.
 * Use `actions` for Journal-style toolbars; omit for simple title + subtitle pages.
 */
export function PageHeader({
  title,
  preTitle,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  const mods = [
    'page-header-shell',
    actions ? 'page-header-shell--has-actions' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className={mods}>
      <div className="page-header-shell__primary">
        {preTitle ? <div className="page-header-pretitle">{preTitle}</div> : null}
        <h1 className="page-title">{title}</h1>
        {subtitle ? <div className="page-header-subtitle">{subtitle}</div> : null}
      </div>
      {actions ? <div className="page-header-shell__actions">{actions}</div> : null}
    </header>
  )
}
