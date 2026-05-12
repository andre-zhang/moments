/**
 * Demo mastheads use real place photos (Wikimedia Commons thumbnails).
 * Per-moment gallery imports: `demoMemoryPhotoPlans.ts` + `demoPlaceThumbUrls.json`.
 */

import demoPlaceThumbUrls from './demoPlaceThumbUrls.json'

const thumbs = demoPlaceThumbUrls as Record<string, string>

export type DemoSamplePhoto = {
  /** Absolute image URL or path under site root */
  src: string
  caption: string
  alt: string
}

/** Rotating scenic set for hash picks. Six distinct images. */
export const DEMO_SAMPLE_PHOTOS: readonly DemoSamplePhoto[] = [
  {
    src: thumbs['m-pch-bixby-0']!,
    caption: 'Big Sur, CA',
    alt: 'Bixby Creek Bridge on the California coast',
  },
  {
    src: thumbs['m-hok-niseko-0']!,
    caption: 'Niseko, Japan',
    alt: 'Snow and ski terrain in Hokkaido',
  },
  {
    src: thumbs['m-ptl-porto-0']!,
    caption: 'Porto, Portugal',
    alt: 'Douro river and the city of Porto',
  },
  {
    src: thumbs['m-nyc-met-0']!,
    caption: 'New York, NY',
    alt: 'The Metropolitan Museum of Art',
  },
  {
    src: thumbs['m-spring-louvre-0']!,
    caption: 'Paris, France',
    alt: 'Louvre pyramid in Paris',
  },
  {
    src: thumbs['m-uk-edinburgh-castle-0']!,
    caption: 'Edinburgh, Scotland',
    alt: 'Edinburgh Castle above the old town',
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

/** Curated masthead picks — indices point at distinct `DEMO_SAMPLE_PHOTOS` entries. */
export const PAGE_DEMO_BANNERS = {
  'places-hero': DEMO_SAMPLE_PHOTOS[2]!,
  'journal-hero': DEMO_SAMPLE_PHOTOS[0]!,
  'journal-empty': DEMO_SAMPLE_PHOTOS[1]!,
  'map-hero': DEMO_SAMPLE_PHOTOS[1]!,
  'storybook-hero': DEMO_SAMPLE_PHOTOS[0]!,
  'friends-hero': DEMO_SAMPLE_PHOTOS[2]!,
  'friend-detail-hero': DEMO_SAMPLE_PHOTOS[0]!,
  'destination-detail-hero': DEMO_SAMPLE_PHOTOS[2]!,
  'settings-hero': DEMO_SAMPLE_PHOTOS[1]!,
  'add-trip-hero': DEMO_SAMPLE_PHOTOS[2]!,
  'add-hub-hero': DEMO_SAMPLE_PHOTOS[0]!,
  'moment-form-hero': DEMO_SAMPLE_PHOTOS[1]!,
  'passport-simple': DEMO_SAMPLE_PHOTOS[3]!,
  'passport-book': DEMO_SAMPLE_PHOTOS[0]!,
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

export { DEMO_MEMORY_PHOTO_PLANS } from './demoMemoryPhotoPlans'
