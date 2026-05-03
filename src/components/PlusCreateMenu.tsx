import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * Single “+” control; opens a menu to add a trip or a moment.
 * Trips, places, and friends are managed under Places & people.
 */
export function PlusCreateMenu({
  className,
  align = 'right',
}: {
  className?: string
  /** Dropdown alignment relative to the + button */
  align?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      className={`plus-create${className ? ` ${className}` : ''}${align === 'left' ? ' plus-create--align-left' : ''}`}
      ref={ref}
    >
      <button
        type="button"
        className="plus-create__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Create: new trip or moment"
      >
        +
      </button>
      {open ? (
        <div className="plus-create__dropdown" role="menu">
          <Link
            to="/add/trip"
            role="menuitem"
            className="plus-create__item"
            onClick={() => setOpen(false)}
          >
            <span className="plus-create__item-title">+ Trip</span>
            <span className="plus-create__item-desc">New trip</span>
          </Link>
          <Link
            to="/add/moment"
            role="menuitem"
            className="plus-create__item"
            onClick={() => setOpen(false)}
          >
            <span className="plus-create__item-title">+ Moment</span>
            <span className="plus-create__item-desc">New moment</span>
          </Link>
        </div>
      ) : null}
    </div>
  )
}
