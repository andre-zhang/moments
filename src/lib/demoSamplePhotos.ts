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
  {
    src: '/sample-photos/demo-meadow.svg',
    caption: 'Hill country (sample)',
    alt: 'Soft green gradient placeholder for bundled demo roll',
  },
  {
    src: '/sample-photos/demo-dusk.svg',
    caption: 'Evening sky (sample)',
    alt: 'Purple and amber gradient placeholder for bundled demo roll',
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
  'journal-empty': DEMO_SAMPLE_PHOTOS[4]!, // meadow — quiet, open
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
      { src: '/sample-photos/demo-alpine.jpg', fileName: 'bixby-bridge-mist-3.jpg' },
    ],
  },
  {
    memoryId: 'm-ptl-porto',
    photos: [
      { src: '/sample-photos/demo-porto.jpg', fileName: 'porto-ribeira-1.jpg' },
      { src: '/sample-photos/demo-coast.jpg', fileName: 'porto-ribeira-2.jpg' },
      { src: '/sample-photos/demo-dusk.svg', fileName: 'porto-river-dusk.svg' },
    ],
  },
  {
    memoryId: 'm-hok-niseko',
    photos: [
      { src: '/sample-photos/demo-alpine.jpg', fileName: 'niseko-1.jpg' },
      { src: '/sample-photos/demo-coast.jpg', fileName: 'niseko-2.jpg' },
      { src: '/sample-photos/demo-meadow.svg', fileName: 'niseko-slope-light.svg' },
    ],
  },
  {
    memoryId: 'm-nyc-met',
    photos: [
      { src: '/sample-photos/demo-city.jpg', fileName: 'met-1.jpg' },
      { src: '/sample-photos/demo-alpine.jpg', fileName: 'met-2.jpg' },
      { src: '/sample-photos/demo-porto.jpg', fileName: 'met-sculpture-hall-3.jpg' },
    ],
  },
  {
    memoryId: 'm-spring-bistro',
    photos: [
      { src: '/sample-photos/demo-porto.jpg', fileName: 'paris-bistro-1.jpg' },
      { src: '/sample-photos/demo-city.jpg', fileName: 'paris-bistro-wine-2.jpg' },
      { src: '/sample-photos/demo-dusk.svg', fileName: 'paris-bistro-evening.svg' },
    ],
  },
  {
    memoryId: 'm-ptl-tram',
    photos: [
      { src: '/sample-photos/demo-porto.jpg', fileName: 'lisbon-tram-1.jpg' },
      { src: '/sample-photos/demo-coast.jpg', fileName: 'lisbon-tram-hill-2.jpg' },
      { src: '/sample-photos/demo-city.jpg', fileName: 'lisbon-tram-street-3.jpg' },
    ],
  },
  {
    memoryId: 'm-ptl-pasteis',
    photos: [
      { src: '/sample-photos/demo-porto.jpg', fileName: 'pasteis-1.jpg' },
      { src: '/sample-photos/demo-city.jpg', fileName: 'pasteis-box-2.jpg' },
      { src: '/sample-photos/demo-meadow.svg', fileName: 'pasteis-queue-outside.svg' },
    ],
  },
  {
    memoryId: 'm-pch-la',
    photos: [
      { src: '/sample-photos/demo-city.jpg', fileName: 'la-tacos-1.jpg' },
      { src: '/sample-photos/demo-coast.jpg', fileName: 'la-tacos-2.jpg' },
      { src: '/sample-photos/demo-porto.jpg', fileName: 'la-night-lights-3.jpg' },
    ],
  },
  {
    memoryId: 'm-spring-louvre',
    photos: [
      { src: '/sample-photos/demo-porto.jpg', fileName: 'louvre-facade-1.jpg' },
      { src: '/sample-photos/demo-city.jpg', fileName: 'louvre-pyramid-2.jpg' },
    ],
  },
  {
    memoryId: 'm-spring-hotel',
    photos: [
      { src: '/sample-photos/demo-city.jpg', fileName: 'paris-hotel-view-1.jpg' },
      { src: '/sample-photos/demo-dusk.svg', fileName: 'paris-hotel-window.svg' },
    ],
  },
  {
    memoryId: 'm-spring-montmartre',
    photos: [
      { src: '/sample-photos/demo-city.jpg', fileName: 'montmartre-steps-1.jpg' },
      { src: '/sample-photos/demo-porto.jpg', fileName: 'montmartre-cafe-2.jpg' },
      { src: '/sample-photos/demo-meadow.svg', fileName: 'montmartre-park.svg' },
    ],
  },
  {
    memoryId: 'm-spring-shinjuku-hotel',
    photos: [
      { src: '/sample-photos/demo-city.jpg', fileName: 'shinjuku-hotel-1.jpg' },
      { src: '/sample-photos/demo-alpine.jpg', fileName: 'shinjuku-night-2.jpg' },
    ],
  },
  {
    memoryId: 'm-spring-yoyogi',
    photos: [
      { src: '/sample-photos/demo-meadow.svg', fileName: 'yoyogi-greenery.svg' },
      { src: '/sample-photos/demo-coast.jpg', fileName: 'yoyogi-walk-2.jpg' },
    ],
  },
  {
    memoryId: 'm-ptl-cascais',
    photos: [
      { src: '/sample-photos/demo-coast.jpg', fileName: 'cascais-water-1.jpg' },
      { src: '/sample-photos/demo-porto.jpg', fileName: 'cascais-town-2.jpg' },
    ],
  },
  {
    memoryId: 'm-ptl-fado',
    photos: [
      { src: '/sample-photos/demo-dusk.svg', fileName: 'fado-room-light.svg' },
      { src: '/sample-photos/demo-porto.jpg', fileName: 'lisbon-evening-2.jpg' },
    ],
  },
  {
    memoryId: 'm-hok-sapporo',
    photos: [
      { src: '/sample-photos/demo-alpine.jpg', fileName: 'sapporo-bowl-1.jpg' },
      { src: '/sample-photos/demo-city.jpg', fileName: 'sapporo-street-2.jpg' },
    ],
  },
  {
    memoryId: 'm-hok-otaru',
    photos: [
      { src: '/sample-photos/demo-alpine.jpg', fileName: 'otaru-canal-1.jpg' },
      { src: '/sample-photos/demo-coast.jpg', fileName: 'otaru-harbor-2.jpg' },
    ],
  },
  {
    memoryId: 'm-hok-onsen-hotel',
    photos: [
      { src: '/sample-photos/demo-alpine.jpg', fileName: 'onsen-mountain-1.jpg' },
      { src: '/sample-photos/demo-meadow.svg', fileName: 'ryokan-garden.svg' },
    ],
  },
  {
    memoryId: 'm-nyc-bagel',
    photos: [
      { src: '/sample-photos/demo-city.jpg', fileName: 'bagel-bench-1.jpg' },
      { src: '/sample-photos/demo-coast.jpg', fileName: 'park-trees-2.jpg' },
    ],
  },
  {
    memoryId: 'm-nyc-hotel',
    photos: [
      { src: '/sample-photos/demo-city.jpg', fileName: 'manhattan-window-1.jpg' },
      { src: '/sample-photos/demo-dusk.svg', fileName: 'city-glow.svg' },
    ],
  },
  {
    memoryId: 'm-nyc-high-line',
    photos: [
      { src: '/sample-photos/demo-city.jpg', fileName: 'highline-rail-1.jpg' },
      { src: '/sample-photos/demo-meadow.svg', fileName: 'highline-plants.svg' },
    ],
  },
  {
    memoryId: 'm-nyc-jazz',
    photos: [
      { src: '/sample-photos/demo-dusk.svg', fileName: 'jazz-venue-dim.svg' },
      { src: '/sample-photos/demo-city.jpg', fileName: 'village-street-2.jpg' },
    ],
  },
  {
    memoryId: 'm-pch-carmel',
    photos: [
      { src: '/sample-photos/demo-coast.jpg', fileName: 'carmel-mist-1.jpg' },
      { src: '/sample-photos/demo-alpine.jpg', fileName: 'carmel-pines-2.jpg' },
    ],
  },
  {
    memoryId: 'm-pch-santa-barbara',
    photos: [
      { src: '/sample-photos/demo-coast.jpg', fileName: 'sb-pier-1.jpg' },
      { src: '/sample-photos/demo-porto.jpg', fileName: 'sb-breakfast-2.jpg' },
    ],
  },
  {
    memoryId: 'm-pch-morro',
    photos: [
      { src: '/sample-photos/demo-coast.jpg', fileName: 'morro-rock-1.jpg' },
      { src: '/sample-photos/demo-city.jpg', fileName: 'morro-beach-2.jpg' },
    ],
  },
  {
    memoryId: 'm-uk-iad-lhr',
    photos: [
      { src: '/sample-photos/demo-dusk.svg', fileName: 'red-eye-sky.svg' },
      { src: '/sample-photos/demo-city.jpg', fileName: 'approach-lights-2.jpg' },
    ],
  },
  {
    memoryId: 'm-uk-chips-pub',
    photos: [
      { src: '/sample-photos/demo-porto.jpg', fileName: 'pub-interior-1.jpg' },
      { src: '/sample-photos/demo-city.jpg', fileName: 'pub-plate-2.jpg' },
    ],
  },
  {
    memoryId: 'm-uk-british-museum',
    photos: [
      { src: '/sample-photos/demo-city.jpg', fileName: 'museum-hall-1.jpg' },
      { src: '/sample-photos/demo-alpine.jpg', fileName: 'museum-light-2.jpg' },
    ],
  },
  {
    memoryId: 'm-uk-hotel-london',
    photos: [
      { src: '/sample-photos/demo-city.jpg', fileName: 'marylebone-room-1.jpg' },
      { src: '/sample-photos/demo-dusk.svg', fileName: 'london-window.svg' },
    ],
  },
  {
    memoryId: 'm-uk-notes-kings-cross',
    photos: [
      { src: '/sample-photos/demo-city.jpg', fileName: 'platform-board-1.jpg' },
      { src: '/sample-photos/demo-porto.jpg', fileName: 'coffee-cart-2.jpg' },
    ],
  },
  {
    memoryId: 'm-uk-edinburgh-castle',
    photos: [
      { src: '/sample-photos/demo-alpine.jpg', fileName: 'castle-rock-1.jpg' },
      { src: '/sample-photos/demo-coast.jpg', fileName: 'castle-wind-2.jpg' },
      { src: '/sample-photos/demo-meadow.svg', fileName: 'castle-green.svg' },
    ],
  },
  {
    memoryId: 'm-uk-whisky-bar',
    photos: [
      { src: '/sample-photos/demo-dusk.svg', fileName: 'whisky-bar-dim.svg' },
      { src: '/sample-photos/demo-porto.jpg', fileName: 'whisky-flight-2.jpg' },
    ],
  },
  {
    memoryId: 'm-uk-calton-hill',
    photos: [
      { src: '/sample-photos/demo-dusk.svg', fileName: 'calton-sunset.svg' },
      { src: '/sample-photos/demo-alpine.jpg', fileName: 'calton-monuments-2.jpg' },
      { src: '/sample-photos/demo-city.jpg', fileName: 'calton-city-skyline-3.jpg' },
    ],
  },
  {
    memoryId: 'm-spring-cdg',
    photos: [
      { src: '/sample-photos/demo-city.jpg', fileName: 'cdg-terminal-1.jpg' },
      { src: '/sample-photos/demo-dusk.svg', fileName: 'cdg-tarmac-dawn.svg' },
      { src: '/sample-photos/demo-alpine.jpg', fileName: 'cdg-window-clouds-3.jpg' },
    ],
  },
  {
    memoryId: 'm-spring-tokyo-flight',
    photos: [
      { src: '/sample-photos/demo-dusk.svg', fileName: 'tokyo-flight-night-sky.svg' },
      { src: '/sample-photos/demo-city.jpg', fileName: 'haneda-approach-2.jpg' },
      { src: '/sample-photos/demo-coast.jpg', fileName: 'flight-coastline-3.jpg' },
    ],
  },
  {
    memoryId: 'm-spring-ramen',
    photos: [
      { src: '/sample-photos/demo-city.jpg', fileName: 'shibuya-neon-1.jpg' },
      { src: '/sample-photos/demo-porto.jpg', fileName: 'ramen-bowl-steam-2.jpg' },
      { src: '/sample-photos/demo-meadow.svg', fileName: 'counter-glow.svg' },
    ],
  },
  {
    memoryId: 'm-echo-2024-0330',
    photos: [
      { src: '/sample-photos/demo-porto.jpg', fileName: 'lisbon-rain-2024-1.jpg' },
      { src: '/sample-photos/demo-coast.jpg', fileName: 'lisbon-waterfront-2024-2.jpg' },
    ],
  },
  {
    memoryId: 'm-echo-2025-0330',
    photos: [
      { src: '/sample-photos/demo-city.jpg', fileName: 'nyc-coffee-2025-1.jpg' },
      { src: '/sample-photos/demo-dusk.svg', fileName: 'midtown-grey.svg' },
    ],
  },
  {
    memoryId: 'm-echo-2026-0330',
    photos: [
      { src: '/sample-photos/demo-meadow.svg', fileName: 'tokyo-buds-2026.svg' },
      { src: '/sample-photos/demo-alpine.jpg', fileName: 'ueno-park-2026-2.jpg' },
      { src: '/sample-photos/demo-city.jpg', fileName: 'tokyo-sky-2026-3.jpg' },
    ],
  },
]
