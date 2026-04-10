import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { IconDots } from './Icons'
import { PlusCreateMenu } from './PlusCreateMenu'
import { useTravel } from '../store/travelStore'

export function Layout() {
  const { importBackup, exportBackup } = useTravel()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const menusRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    const close = (e: MouseEvent) => {
      if (menusRef.current?.contains(e.target as Node)) return
      setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  const downloadBackup = () => {
    const blob = new Blob([exportBackup()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `moments-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMenuOpen(false)
  }

  const onImportFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importBackup(String(reader.result))
        setMenuOpen(false)
        navigate('/')
      } catch {
        alert('Could not import that file.')
      }
    }
    reader.readAsText(f)
    e.target.value = ''
  }

  return (
    <div className="shell">
      <header className="top-nav">
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
            to="/places"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Places &amp; people
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
                <div className="dropdown-section-label">More</div>
                <Link to="/storybook" role="menuitem" onClick={() => setMenuOpen(false)}>
                  Storybook
                </Link>
                <Link to="/settings" role="menuitem" onClick={() => setMenuOpen(false)}>
                  Settings
                </Link>
                <div className="dropdown-section-label">Data</div>
                <button type="button" role="menuitem" onClick={downloadBackup}>
                  Export backup
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => fileRef.current?.click()}
                >
                  Import backup
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={onImportFile}
        />
      </header>

      <div className="shell-body">
        <Outlet />
      </div>

      <footer className="site-footer">
        <p>Local only unless you export.</p>
      </footer>
    </div>
  )
}
