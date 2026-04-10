export interface PhotonHit {
  label: string
  lat: number
  lng: number
  countryCode?: string
  state?: string
}

interface PhotonResponse {
  features?: {
    geometry: { coordinates: [number, number] }
    properties: {
      name?: string
      street?: string
      city?: string
      country?: string
      countrycode?: string
      state?: string
      type?: string
    }
  }[]
}

export async function photonSearch(query: string): Promise<PhotonHit[]> {
  const q = query.trim()
  if (q.length < 2) return []
  const base =
    typeof import.meta !== 'undefined' && import.meta.env?.DEV
      ? '/photon'
      : 'https://photon.komoot.io'
  const url = `${base}/api/?q=${encodeURIComponent(q)}&limit=8`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = (await res.json()) as PhotonResponse
  const out: PhotonHit[] = []
  for (const f of data.features ?? []) {
    const [lng, lat] = f.geometry.coordinates
    const p = f.properties
    const label =
      [p.name, p.street, p.city, p.country].filter(Boolean).join(', ') ||
      'Unnamed place'
    out.push({
      label,
      lat,
      lng,
      countryCode: p.countrycode?.toUpperCase(),
      state: p.state,
    })
  }
  return out
}

/** Reverse geocode pin position (for country/region metadata without manual ISO fields). */
export async function photonReverse(
  lat: number,
  lng: number
): Promise<PhotonHit | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  const base =
    typeof import.meta !== 'undefined' && import.meta.env?.DEV
      ? '/photon'
      : 'https://photon.komoot.io'
  const url = `${base}/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as PhotonResponse
  const f = data.features?.[0]
  if (!f) return null
  const [flng, flat] = f.geometry.coordinates
  const p = f.properties
  const label =
    [p.name, p.street, p.city, p.country].filter(Boolean).join(', ') ||
    'Dropped pin'
  return {
    label,
    lat: flat,
    lng: flng,
    countryCode: p.countrycode?.toUpperCase(),
    state: p.state,
  }
}
