import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { IconDots } from './Icons'
import { PlusCreateMenu } from './PlusCreateMenu'

export function Layout() {
  const menusRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    const close = (e: MouseEvent) => {
      if (!menusRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  return (
    <div className="shell">
      <header className="top-nav">
        <div className="app-chrome top-nav__chrome">
          <Link to="/" className="logo">
            Moments
          </Link>

          <nav className="nav-primary">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} end>
              Journal
            </NavLink>
            <NavLink
              to="/passport"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Passport
            </NavLink>
            <NavLink
              to="/map"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Map
            </NavLink>
            <NavLink
              to="/storybook"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Storybook
            </NavLink>
          </nav>

          <div className="nav-actions" ref={menusRef}>
            <PlusCreateMenu className="nav-plus-create" />
            <div className={`menu-wrap${menuOpen ? ' menu-wrap--open' : ''}`}>
              <button
                type="button"
                className="btn-nav-menu"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen((o) => !o)
                }}
              >
                <IconDots className="btn-icon-svg" />
                Menu
              </button>
              {menuOpen ? (
                <div className="dropdown dropdown--wide" role="menu">
                  <Link
                    to="/places"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    Places &amp; people
                  </Link>
                  <Link
                    to="/settings"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="shell-body">
        <div className="app-chrome app-chrome--main">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
