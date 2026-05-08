export type AmbientScenic = {
  imageUrl: string
  location: string
  alt: string
}

const AMBIENT_SCENES: AmbientScenic[] = [
  {
    imageUrl:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    location: 'Banff, Canada',
    alt: 'Snowy mountain range above a lake',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
    location: 'Lofoten, Norway',
    alt: 'Sharp mountains rising from the sea',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    location: 'Dolomites, Italy',
    alt: 'Alpine meadow with layered mountain peaks',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    location: 'Yosemite, USA',
    alt: 'Forest road with soft morning light',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    location: 'Iceland Highlands',
    alt: 'Wide valley with river and distant mountains',
  },
]

function hash(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function pickAmbientScenic(seed: string): AmbientScenic {
  return AMBIENT_SCENES[hash(seed) % AMBIENT_SCENES.length]!
}
