import demoPlaceThumbUrls from './demoPlaceThumbUrls.json'

const thumbs = demoPlaceThumbUrls as Record<string, string>

function shot(slug: string, fileName: string) {
  const src = thumbs[slug]
  if (!src) throw new Error(`Missing demo thumb slug: ${slug}`)
  return { src, fileName }
}

/**
 * Each slot maps to a distinct Wikimedia Commons thumbnail (see scripts/build-demo-place-thumb-urls.mjs).
 * First photo per memory is unique so journal cards do not reuse the same cover image.
 */
export const DEMO_MEMORY_PHOTO_PLANS: readonly {
  memoryId: string
  photos: readonly { src: string; fileName: string }[]
}[] = [
  {
    memoryId: 'm-pch-sf',
    photos: [
      shot('m-pch-sf-0', 'sf-golden-gate-1.jpg'),
      shot('m-pch-sf-1', 'sf-mission-2.jpg'),
      shot('m-pch-sf-2', 'sf-castro-3.jpg'),
    ],
  },
  {
    memoryId: 'm-pch-bixby',
    photos: [
      shot('m-pch-bixby-0', 'bixby-bridge-1.jpg'),
      shot('m-pch-bixby-1', 'big-sur-coast-2.jpg'),
      shot('m-pch-bixby-2', 'pch-ocean-3.jpg'),
    ],
  },
  {
    memoryId: 'm-ptl-porto',
    photos: [
      shot('m-ptl-porto-0', 'porto-douro-1.jpg'),
      shot('m-ptl-porto-1', 'porto-bridge-2.jpg'),
      shot('m-ptl-porto-2', 'porto-ribeira-3.jpg'),
    ],
  },
  {
    memoryId: 'm-hok-niseko',
    photos: [
      shot('m-hok-niseko-0', 'niseko-ski-1.jpg'),
      shot('m-hok-niseko-1', 'yotei-2.jpg'),
      shot('m-hok-niseko-2', 'hokkaido-snow-3.jpg'),
    ],
  },
  {
    memoryId: 'm-nyc-met',
    photos: [
      shot('m-nyc-met-0', 'met-facade-1.jpg'),
      shot('m-nyc-met-1', 'met-greek-2.jpg'),
      shot('m-nyc-met-2', 'met-steps-3.jpg'),
    ],
  },
  {
    memoryId: 'm-spring-bistro',
    photos: [
      shot('m-spring-bistro-0', 'paris-bistro-1.jpg'),
      shot('m-spring-bistro-1', 'paris-wine-2.jpg'),
      shot('m-spring-bistro-2', 'paris-cafe-3.jpg'),
    ],
  },
  {
    memoryId: 'm-ptl-tram',
    photos: [
      shot('m-ptl-tram-0', 'lisbon-tram-1.jpg'),
      shot('m-ptl-tram-1', 'lisbon-alfama-2.jpg'),
      shot('m-ptl-tram-2', 'lisbon-view-3.jpg'),
    ],
  },
  {
    memoryId: 'm-ptl-pasteis',
    photos: [
      shot('m-ptl-pasteis-0', 'pasteis-1.jpg'),
      shot('m-ptl-pasteis-1', 'belem-tower-2.jpg'),
      shot('m-ptl-pasteis-2', 'jeronimos-3.jpg'),
    ],
  },
  {
    memoryId: 'm-pch-la',
    photos: [
      shot('m-pch-la-0', 'la-skyline-1.jpg'),
      shot('m-pch-la-1', 'venice-beach-2.jpg'),
      shot('m-pch-la-2', 'la-murals-3.jpg'),
    ],
  },
  {
    memoryId: 'm-spring-louvre',
    photos: [
      shot('m-spring-louvre-0', 'louvre-pyramid-1.jpg'),
      shot('m-spring-louvre-1', 'louvre-interior-2.jpg'),
    ],
  },
  {
    memoryId: 'm-spring-hotel',
    photos: [
      shot('m-spring-hotel-0', 'paris-haussmann-1.jpg'),
      shot('m-spring-hotel-1', 'eiffel-champ-2.jpg'),
    ],
  },
  {
    memoryId: 'm-spring-montmartre',
    photos: [
      shot('m-spring-montmartre-0', 'sacre-coeur-1.jpg'),
      shot('m-spring-montmartre-1', 'tertre-2.jpg'),
      shot('m-spring-montmartre-2', 'montmartre-stairs-3.jpg'),
    ],
  },
  {
    memoryId: 'm-spring-shinjuku-hotel',
    photos: [
      shot('m-spring-shinjuku-hotel-0', 'shinjuku-night-1.jpg'),
      shot('m-spring-shinjuku-hotel-1', 'tokyo-towers-2.jpg'),
    ],
  },
  {
    memoryId: 'm-spring-yoyogi',
    photos: [
      shot('m-spring-yoyogi-0', 'meiji-1.jpg'),
      shot('m-spring-yoyogi-1', 'yoyogi-trees-2.jpg'),
    ],
  },
  {
    memoryId: 'm-ptl-cascais',
    photos: [
      shot('m-ptl-cascais-0', 'cascais-beach-1.jpg'),
      shot('m-ptl-cascais-1', 'cascais-marina-2.jpg'),
    ],
  },
  {
    memoryId: 'm-ptl-fado',
    photos: [
      shot('m-ptl-fado-0', 'lisbon-night-1.jpg'),
      shot('m-ptl-fado-1', 'fado-guitar-2.jpg'),
    ],
  },
  {
    memoryId: 'm-hok-sapporo',
    photos: [
      shot('m-hok-sapporo-0', 'sapporo-snowfest-1.jpg'),
      shot('m-hok-sapporo-1', 'odori-winter-2.jpg'),
    ],
  },
  {
    memoryId: 'm-hok-otaru',
    photos: [
      shot('m-hok-otaru-0', 'otaru-canal-1.jpg'),
      shot('m-hok-otaru-1', 'otaru-warehouse-2.jpg'),
    ],
  },
  {
    memoryId: 'm-hok-onsen-hotel',
    photos: [
      shot('m-hok-onsen-hotel-0', 'onsen-outdoor-1.jpg'),
      shot('m-hok-onsen-hotel-1', 'ryokan-winter-2.jpg'),
    ],
  },
  {
    memoryId: 'm-nyc-bagel',
    photos: [
      shot('m-nyc-bagel-0', 'prospect-park-1.jpg'),
      shot('m-nyc-bagel-1', 'brooklyn-brownstones-2.jpg'),
    ],
  },
  {
    memoryId: 'm-nyc-hotel',
    photos: [
      shot('m-nyc-hotel-0', 'manhattan-dusk-1.jpg'),
      shot('m-nyc-hotel-1', 'times-square-2.jpg'),
    ],
  },
  {
    memoryId: 'm-nyc-high-line',
    photos: [
      shot('m-nyc-high-line-0', 'high-line-1.jpg'),
      shot('m-nyc-high-line-1', 'chelsea-highline-2.jpg'),
    ],
  },
  {
    memoryId: 'm-nyc-jazz',
    photos: [
      shot('m-nyc-jazz-0', 'greenwich-village-1.jpg'),
      shot('m-nyc-jazz-1', 'jazz-club-2.jpg'),
    ],
  },
  {
    memoryId: 'm-pch-carmel',
    photos: [
      shot('m-pch-carmel-0', 'carmel-beach-1.jpg'),
      shot('m-pch-carmel-1', 'point-lobos-2.jpg'),
    ],
  },
  {
    memoryId: 'm-pch-santa-barbara',
    photos: [
      shot('m-pch-santa-barbara-0', 'sb-pier-1.jpg'),
      shot('m-pch-santa-barbara-1', 'stearns-wharf-2.jpg'),
    ],
  },
  {
    memoryId: 'm-pch-morro',
    photos: [
      shot('m-pch-morro-0', 'morro-rock-1.jpg'),
      shot('m-pch-morro-1', 'morro-bay-harbor-2.jpg'),
    ],
  },
  {
    memoryId: 'm-uk-iad-lhr',
    photos: [
      shot('m-uk-iad-lhr-0', 'heathrow-terminal-1.jpg'),
      shot('m-uk-iad-lhr-1', 'ba-heathrow-2.jpg'),
    ],
  },
  {
    memoryId: 'm-uk-chips-pub',
    photos: [
      shot('m-uk-chips-pub-0', 'english-pub-1.jpg'),
      shot('m-uk-chips-pub-1', 'fish-chips-2.jpg'),
    ],
  },
  {
    memoryId: 'm-uk-british-museum',
    photos: [
      shot('m-uk-british-museum-0', 'british-museum-court-1.jpg'),
      shot('m-uk-british-museum-1', 'british-museum-gallery-2.jpg'),
    ],
  },
  {
    memoryId: 'm-uk-hotel-london',
    photos: [
      shot('m-uk-hotel-london-0', 'marylebone-1.jpg'),
      shot('m-uk-hotel-london-1', 'regents-park-2.jpg'),
    ],
  },
  {
    memoryId: 'm-uk-notes-kings-cross',
    photos: [
      shot('m-uk-notes-kings-cross-0', 'kings-cross-1.jpg'),
      shot('m-uk-notes-kings-cross-1', 'st-pancras-2.jpg'),
    ],
  },
  {
    memoryId: 'm-uk-edinburgh-castle',
    photos: [
      shot('m-uk-edinburgh-castle-0', 'edinburgh-castle-1.jpg'),
      shot('m-uk-edinburgh-castle-1', 'castle-rock-2.jpg'),
      shot('m-uk-edinburgh-castle-2', 'edinburgh-old-town-3.jpg'),
    ],
  },
  {
    memoryId: 'm-uk-whisky-bar',
    photos: [
      shot('m-uk-whisky-bar-0', 'whisky-tasting-1.jpg'),
      shot('m-uk-whisky-bar-1', 'grassmarket-2.jpg'),
    ],
  },
  {
    memoryId: 'm-uk-calton-hill',
    photos: [
      shot('m-uk-calton-hill-0', 'calton-sunset-1.jpg'),
      shot('m-uk-calton-hill-1', 'nelson-monument-2.jpg'),
      shot('m-uk-calton-hill-2', 'edinburgh-skyline-3.jpg'),
    ],
  },
  {
    memoryId: 'm-spring-cdg',
    photos: [
      shot('m-spring-cdg-0', 'cdg-terminal-1.jpg'),
      shot('m-spring-cdg-1', 'air-france-cdg-2.jpg'),
      shot('m-spring-cdg-2', 'cdg-runway-3.jpg'),
    ],
  },
  {
    memoryId: 'm-spring-tokyo-flight',
    photos: [
      shot('m-spring-tokyo-flight-0', 'haneda-1.jpg'),
      shot('m-spring-tokyo-flight-1', 'jal-haneda-2.jpg'),
      shot('m-spring-tokyo-flight-2', 'fuji-from-plane-3.jpg'),
    ],
  },
  {
    memoryId: 'm-spring-ramen',
    photos: [
      shot('m-spring-ramen-0', 'shibuya-night-1.jpg'),
      shot('m-spring-ramen-1', 'ramen-bowl-2.jpg'),
      shot('m-spring-ramen-2', 'izakaya-3.jpg'),
    ],
  },
  {
    memoryId: 'm-echo-2024-0330',
    photos: [
      shot('m-echo-2024-0330-0', 'lisbon-rain-1.jpg'),
      shot('m-echo-2024-0330-1', 'tagus-waterfront-2.jpg'),
    ],
  },
  {
    memoryId: 'm-echo-2025-0330',
    photos: [
      shot('m-echo-2025-0330-0', 'central-park-1.jpg'),
      shot('m-echo-2025-0330-1', 'nyc-coffee-2.jpg'),
    ],
  },
  {
    memoryId: 'm-echo-2026-0330',
    photos: [
      shot('m-echo-2026-0330-0', 'ueno-sakura-1.jpg'),
      shot('m-echo-2026-0330-1', 'skytree-2.jpg'),
      shot('m-echo-2026-0330-2', 'chidorigafuchi-3.jpg'),
    ],
  },
]
