/** Decorative passport stamp art keyed by stamp id prefix from `computeStamps`. */
export function PassportStampGlyph({ stampId }: { stampId: string }) {
  const variant = stampVariant(stampId)
  const common = {
    viewBox: '0 0 56 56',
    className: 'passport-stamp-glyph',
    'aria-hidden': true as const,
  }

  switch (variant) {
    case 'flight':
      return (
        <svg {...common}>
          <rect
            x="4"
            y="4"
            width="48"
            height="48"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            opacity="0.85"
          />
          <path
            d="M28 38 L18 28 L26 28 L22 14 L34 14 L30 28 L38 28 Z"
            fill="currentColor"
            opacity="0.35"
          />
          <circle cx="28" cy="28" r="20" fill="none" stroke="currentColor" strokeWidth="0.9" strokeDasharray="2 3" opacity="0.5" />
        </svg>
      )
    case 'trip':
      return (
        <svg {...common}>
          <rect x="5" y="8" width="46" height="40" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.8" />
          <path d="M12 18 H44 M12 26 H38 M12 34 H44" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
          <circle cx="18" cy="22" r="4" fill="currentColor" opacity="0.25" />
        </svg>
      )
    case 'pin':
      return (
        <svg {...common}>
          <path
            d="M28 10 C21 10 16 15 16 22 C16 30 28 46 28 46 C28 46 40 30 40 22 C40 15 35 10 28 10 Z"
            fill="currentColor"
            opacity="0.28"
          />
          <circle cx="28" cy="22" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.75" />
        </svg>
      )
    case 'country':
      return (
        <svg {...common}>
          <circle cx="28" cy="28" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
          <ellipse cx="28" cy="28" rx="20" ry="10" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <path d="M8 28 H48 M28 8 C18 28 18 28 28 48 C38 28 38 28 28 8" fill="none" stroke="currentColor" strokeWidth="0.85" opacity="0.35" />
        </svg>
      )
    case 'region':
      return (
        <svg {...common}>
          <path
            d="M10 38 L18 16 L28 24 L36 12 L46 38 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            opacity="0.65"
          />
          <path d="M14 32 H42" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <rect x="6" y="6" width="44" height="44" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
          <text x="28" y="34" textAnchor="middle" fontSize="18" fill="currentColor" opacity="0.4">
            ✦
          </text>
        </svg>
      )
  }
}

function stampVariant(id: string):
  | 'flight'
  | 'trip'
  | 'pin'
  | 'country'
  | 'region'
  | 'default' {
  if (id.startsWith('first-flight')) return 'flight'
  if (id === 'atlas-trips-destinations') return 'trip'
  if (id === 'footprint-geography') return 'country'
  if (id === 'timeline-start') return 'pin'
  /* legacy ids if any backup still references old stamps */
  if (id.startsWith('first-trip-moment')) return 'trip'
  if (id.startsWith('first-dest')) return 'pin'
  if (id.startsWith('country-')) return 'country'
  if (id.startsWith('region-')) return 'region'
  return 'default'
}
