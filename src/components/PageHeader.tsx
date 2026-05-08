import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export type PageHeaderProps = {
  /** Main heading (string or fragment for rich titles, e.g. friend color bar + name). */
  title: ReactNode
  /** Breadcrumb, back link, or kicker above the title. */
  preTitle?: ReactNode
  /** Intro or stats below the title (use `className="page-subtitle"` on inner `<p>` when needed). */
  subtitle?: ReactNode
  /** Toolbar / filters — aligns to the title row on wide layouts. */
  actions?: ReactNode
  /**
   * When true (and `actions` is set), title + subtitle sit in a block, then the toolbar,
   * then the bottom border — same rhythm as Journal / Map / Passport (simple).
   */
  toolbarBelow?: boolean
  /** Extra classes on `<header>` (e.g. `places-hero`). */
  className?: string
  /**
   * Full-width title-card / masthead photo from `public/` (bundled sample roll or user uploads mirrored to same path pattern in prod).
   */
  banner?: {
    src: string
    caption?: string
    alt?: string
    /** Opens a related moment (e.g. seed story for the masthead photo). */
    captionTo?: string
  }
}

function shellMods(
  actionsInHeader: boolean,
  toolbarBelow: boolean | undefined,
  className: string | undefined,
  withBanner: boolean,
  bannerToolbarSplit: boolean
) {
  return [
    'page-header-shell',
    actionsInHeader ? 'page-header-shell--has-actions' : '',
    actionsInHeader && toolbarBelow && !bannerToolbarSplit
      ? 'page-header-shell--toolbar-below'
      : '',
    bannerToolbarSplit ? 'page-header-shell--toolbar-below-banner-split' : '',
    withBanner ? 'page-header-shell--banner-hero' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')
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
  toolbarBelow,
  className,
  banner,
}: PageHeaderProps) {
  const bannerToolbarSplit = Boolean(
    banner && toolbarBelow && actions
  )

  const actionsInHeader = Boolean(actions && !bannerToolbarSplit)

  const mods = shellMods(
    actionsInHeader,
    toolbarBelow,
    className,
    Boolean(banner),
    bannerToolbarSplit
  )

  const primary = (
    <div className="page-header-shell__primary">
      {preTitle ? <div className="page-header-pretitle">{preTitle}</div> : null}
      <h1 className="page-title">{title}</h1>
      {subtitle ? <div className="page-header-subtitle">{subtitle}</div> : null}
    </div>
  )

  const caption =
    banner?.caption != null && banner.caption !== '' ? (
      <p className="page-header-banner-caption">
        {banner.captionTo ? (
          <Link className="page-header-banner-caption-link" to={banner.captionTo}>
            {banner.caption}
          </Link>
        ) : (
          banner.caption
        )}
      </p>
    ) : null

  const bannerLayers =
    banner != null ? (
      <>
        <div
          className="page-header-banner-bg"
          style={{ backgroundImage: `url(${banner.src})` }}
          role={banner.alt ? 'img' : undefined}
          aria-label={banner.alt}
          aria-hidden={banner.alt ? undefined : true}
        />
        <div className="page-header-banner-scrim" aria-hidden />
      </>
    ) : null

  if (bannerToolbarSplit) {
    return (
      <div className="page-header-banner-stack">
        <header className={mods}>
          {bannerLayers}
          <div className="page-header-shell__layer page-header-shell__layer--banner">
            {primary}
          </div>
          {caption}
        </header>
        <div className="page-header-shell-toolbar-band">{actions}</div>
      </div>
    )
  }

  if (banner != null) {
    return (
      <header className={mods}>
        {bannerLayers}
        <div className="page-header-shell__layer page-header-shell__layer--banner">
          {primary}
        </div>
        {actions ? (
          <div className="page-header-shell__actions page-header-shell__actions--on-banner">
            {actions}
          </div>
        ) : null}
        {caption}
      </header>
    )
  }

  return (
    <header className={mods}>
      {primary}
      {actions ? <div className="page-header-shell__actions">{actions}</div> : null}
    </header>
  )
}
