/** Catmull–Rom sample between p1 → p2 (uses p0, p3 for tangent). t ∈ (0, 1]. */
function catmullRom(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  t: number
): [number, number] {
  const t2 = t * t
  const t3 = t2 * t
  const x =
    0.5 *
    (2 * p1[0] +
      (-p0[0] + p2[0]) * t +
      (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
      (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
  const y =
    0.5 *
    (2 * p1[1] +
      (-p0[1] + p2[1]) * t +
      (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
      (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
  return [x, y]
}

/**
 * Smooths a geographic polyline for nicer map rendering (trip connectors, etc.).
 * Keeps endpoints; inserts Catmull–Rom samples along each segment.
 */
export function smoothLatLngPath(
  positions: [number, number][],
  subdivisionsPerSegment = 10
): [number, number][] {
  if (positions.length < 2) return positions
  if (positions.length === 2) return [...positions]

  const out: [number, number][] = [[...positions[0]!]]
  const n = positions.length
  const k = Math.max(2, subdivisionsPerSegment)

  for (let i = 0; i < n - 1; i++) {
    const p0 = i === 0 ? positions[0]! : positions[i - 1]!
    const p1 = positions[i]!
    const p2 = positions[i + 1]!
    const p3 = i + 2 < n ? positions[i + 2]! : positions[i + 1]!
    for (let j = 1; j <= k; j++) {
      const t = j / k
      out.push(catmullRom(p0, p1, p2, p3, t))
    }
  }
  return out
}
