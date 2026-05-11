/**
 * Bundled “sample roll” images shipped in `public/sample-photos/`.
 * Same files are injected into IndexedDB for specific demo moments so they behave like real uploads.
 */

export type DemoSamplePhoto = {
  /** URL path under site root (Vite `public/`) */
  src: string
  /** Tiny location line (spotlight-style) */
  caption: string
  alt: string
}

/** Canonical set — keep in sync with files in `public/sample-photos/`. */
export const DEMO_SAMPLE_PHOTOS: readonly DemoSamplePhoto[] = [
  {
    src: '/sample-photos/demo-coast.jpg',
    caption: 'Big Sur, CA',
    alt: 'Cliffs and ocean along a coastline',
  },
  {
    src: '/sample-photos/demo-alpine.jpg',
    caption: 'Swiss Alps',
    alt: 'Snow-covered mountain ridges above clouds',
  },
  {
    src: '/sample-photos/demo-porto.jpg',
    caption: 'Cinque Terre, Italy',
    alt: 'Colorful coastal town on a hillside',
  },
  {
    src: '/sample-photos/demo-city.jpg',
    caption: 'New York, NY',
    alt: 'City skyline at dusk',
  },
] as const

function hash(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** Deterministic scenic pick for banners / empty states. */
export function pickDemoSamplePhoto(seed: string): DemoSamplePhoto {
  return DEMO_SAMPLE_PHOTOS[hash(seed) % DEMO_SAMPLE_PHOTOS.length]!
}

/**
 * Curated masthead / title-card picks (not hash-random) so each screen reads intentionally.
 * Intentionally **varied** images — `demo-city.jpg` is reserved for one hero only.
 */
export const PAGE_DEMO_BANNERS = {
  'places-hero': DEMO_SAMPLE_PHOTOS[2]!, // Cinque Terre — “places”
  'journal-hero': DEMO_SAMPLE_PHOTOS[0]!, // coast — diary / timeline
  'journal-empty': DEMO_SAMPLE_PHOTOS[1]!, // Alps — quiet, open
  'map-hero': DEMO_SAMPLE_PHOTOS[1]!, // Alps — routes & pins (card inset like other tabs)
  'storybook-hero': DEMO_SAMPLE_PHOTOS[0]!, // coast — narrative journey
  'friends-hero': DEMO_SAMPLE_PHOTOS[2]!, // coastal town — people
  'friend-detail-hero': DEMO_SAMPLE_PHOTOS[0]!, // coast
  'destination-detail-hero': DEMO_SAMPLE_PHOTOS[2]!, // colorful place
  'settings-hero': DEMO_SAMPLE_PHOTOS[1]!, // calm alpine — prefs
  'add-trip-hero': DEMO_SAMPLE_PHOTOS[2]!, // inviting — new trip
  'add-hub-hero': DEMO_SAMPLE_PHOTOS[0]!, // coast — doorway in
  'moment-form-hero': DEMO_SAMPLE_PHOTOS[1]!, // alpine — drafting
  'passport-simple': DEMO_SAMPLE_PHOTOS[3]!, // **only** city skyline hero
  'passport-book': DEMO_SAMPLE_PHOTOS[0]!, // coast — spread / journey
} as const satisfies Record<string, DemoSamplePhoto>

/** Seed moment — caption tap opens this memory (bundled photo lines up with story). */
export const PAGE_BANNER_RELATED_MEMORY: Partial<
  Record<keyof typeof PAGE_DEMO_BANNERS, string>
> = {
  'places-hero': 'm-ptl-porto',
  'journal-hero': 'm-pch-bixby',
  'journal-empty': 'm-hok-niseko',
  'map-hero': 'm-hok-niseko',
  'storybook-hero': 'm-pch-bixby',
  'friends-hero': 'm-ptl-porto',
  'friend-detail-hero': 'm-pch-bixby',
  'destination-detail-hero': 'm-ptl-porto',
  'settings-hero': 'm-hok-niseko',
  'add-trip-hero': 'm-ptl-porto',
  'add-hub-hero': 'm-pch-bixby',
  'moment-form-hero': 'm-hok-niseko',
  'passport-simple': 'm-nyc-met',
  'passport-book': 'm-pch-bixby',
}

export type MastheadBanner = DemoSamplePhoto & {
  /** Route (path + query) for caption link */
  captionTo?: string
}

export function getPageDemoBanner(
  key: keyof typeof PAGE_DEMO_BANNERS
): DemoSamplePhoto {
  return PAGE_DEMO_BANNERS[key]
}

export function getPageMasthead(
  key: keyof typeof PAGE_DEMO_BANNERS,
  from: string
): MastheadBanner {
  const b = getPageDemoBanner(key)
  const mem = PAGE_BANNER_RELATED_MEMORY[key]
  return {
    src: b.src,
    caption: b.caption,
    alt: b.alt,
    ...(mem != null
      ? {
          captionTo: `/moment/${encodeURIComponent(mem)}?from=${encodeURIComponent(from)}`,
        }
      : {}),
  }
}

/**
 * Demo moments get bundled uploads (local/offline). Multiple rows per memory add extra shots;
 * `ensureDemoSamplePhotosImported` appends until each plan is satisfied.
 */
export const DEMO_MEMORY_PHOTO_PLANS: readonly {
  memoryId: string
  photos: readonly { src: string; fileName: string }[]
}[] = [
  {
    memoryId: 'm-pch-sf',
    photos: [
      { src: '/sample-photos/demo-coast.jpg', fileName: 'pch-coffee-1.jpg' },
      { src: '/sample-photos/demo-city.jpg', fileName: 'pch-coffee-2.jpg' },
      { src: '/sample-photos/demo-alpine.jpg', fileName: 'pch-coffee-3.jpg' },
    ],
  },
  {
    memoryId: 'm-pch-bixby',
    photos: [
      { src: '/sample-photos/demo-coast.jpg', fileName: 'bixby-1.jpg' },
      { src: '/sample-photos/demo-porto.jpg', fileName: 'bixby-2.jpg' },
    ],
  },
  {
    memoryId: 'm-ptl-porto',
    photos: [
      { src: '/sample-photos/demo-porto.jpg', fileName: 'porto-ribeira-1.jpg' },
      { src: '/sample-photos/demo-coast.jpg', fileName: 'porto-ribeira-2.jpg' },
    ],
  },
  {
    memoryId: 'm-hok-niseko',
    photos: [
      { src: '/sample-photos/demo-alpine.jpg', fileName: 'niseko-1.jpg' },
      { src: '/sample-photos/demo-coast.jpg', fileName: 'niseko-2.jpg' },
    ],
  },
  {
    memoryId: 'm-nyc-met',
    photos: [
      { src: '/sample-photos/demo-city.jpg', fileName: 'met-1.jpg' },
      { src: '/sample-photos/demo-alpine.jpg', fileName: 'met-2.jpg' },
    ],
  },
  {
    memoryId: 'm-spring-bistro',
    photos: [{ src: '/sample-photos/demo-porto.jpg', fileName: 'paris-bistro-1.jpg' }],
  },
  {
    memoryId: 'm-ptl-tram',
    photos: [{ src: '/sample-photos/demo-porto.jpg', fileName: 'lisbon-tram-1.jpg' }],
  },
  {
    memoryId: 'm-ptl-pasteis',
    photos: [{ src: '/sample-photos/demo-porto.jpg', fileName: 'pasteis-1.jpg' }],
  },
  {
    memoryId: 'm-pch-la',
    photos: [
      { src: '/sample-photos/demo-city.jpg', fileName: 'la-tacos-1.jpg' },
      { src: '/sample-photos/demo-coast.jpg', fileName: 'la-tacos-2.jpg' },
    ],
  },
]
