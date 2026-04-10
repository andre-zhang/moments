/** Great-circle interpolation for map arcs (WGS84 sphere). */
export function greatCircleLatLngs(
  a: [number, number],
  b: [number, number],
  segments = 48
): [number, number][] {
  const φ1 = (a[0] * Math.PI) / 180
  const λ1 = (a[1] * Math.PI) / 180
  const φ2 = (b[0] * Math.PI) / 180
  const λ2 = (b[1] * Math.PI) / 180
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((φ2 - φ1) / 2) ** 2 +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2
      )
    )
  if (!Number.isFinite(d) || d < 1e-8) return [a, b]
  const out: [number, number][] = []
  for (let i = 0; i <= segments; i++) {
    const f = i / segments
    const A = Math.sin((1 - f) * d) / Math.sin(d)
    const B = Math.sin(f * d) / Math.sin(d)
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2)
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2)
    const z = A * Math.sin(φ1) + B * Math.sin(φ2)
    const φ = Math.atan2(z, Math.sqrt(x * x + y * y))
    const λ = Math.atan2(y, x)
    out.push([(φ * 180) / Math.PI, (λ * 180) / Math.PI])
  }
  return out
}
