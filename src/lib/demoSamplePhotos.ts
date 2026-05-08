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

/** Seed demo moments → sample file on disk (injected as uploads in local mode). */
export const DEMO_MEMORY_PHOTO_BINDINGS: readonly {
  memoryId: string
  src: string
  fileName: string
}[] = [
  {
    memoryId: 'm-pch-bixby',
    src: '/sample-photos/demo-coast.jpg',
    fileName: 'big-sur-coast.jpg',
  },
  {
    memoryId: 'm-hok-niseko',
    src: '/sample-photos/demo-alpine.jpg',
    fileName: 'niseko-alpine.jpg',
  },
  {
    memoryId: 'm-ptl-porto',
    src: '/sample-photos/demo-porto.jpg',
    fileName: 'porto-coastal.jpg',
  },
  {
    memoryId: 'm-nyc-met',
    src: '/sample-photos/demo-city.jpg',
    fileName: 'nyc-skyline.jpg',
  },
]
