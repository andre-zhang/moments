import type { TagCategory } from '../types'

export const DEFAULT_TAG_CATEGORIES: TagCategory[] = [
  {
    id: 'vibe',
    label: 'Vibe',
    tags: [
      'golden hour',
      'main character energy',
      'chaotic good',
      'soft & slow',
      'big city buzz',
      'off the map',
      'locals only',
      'plot twist',
    ],
  },
  {
    id: 'mood',
    label: 'Mood',
    tags: [
      'cozy',
      'electric',
      'melancholic',
      'giddy',
      'feral',
      'peaceful',
      'nostalgic',
      'adventurous',
    ],
  },
  {
    id: 'moment',
    label: 'Moment',
    tags: [
      'first time',
      'last night',
      'rainy day win',
      'sunrise mission',
      'missed train, good story',
      'no plan, best plan',
      'tiny joy',
      'photo worth it',
    ],
  },
  {
    id: 'activity',
    label: 'Activity',
    /** Skip restaurants — use Cuisine choice list instead of e.g. “transit”. */
    appliesToKinds: ['flight', 'hotel', 'sight', 'note'],
    tags: [
      'food',
      'coffee',
      'transit',
      'museum',
      'hike',
      'nightlife',
      'shopping',
      'people-watching',
    ],
  },
]

export function cloneDefaultCategories(): TagCategory[] {
  return DEFAULT_TAG_CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    tags: [...c.tags],
    tagColors: {},
    ...(c.appliesToKinds ? { appliesToKinds: [...c.appliesToKinds] } : {}),
  }))
}
