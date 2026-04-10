/** Stable pastel background from a string (when no custom hex). */
export function fallbackTagBg(tag: string): string {
  let h = 0
  for (let i = 0; i < tag.length; i++) {
    h = (Math.imul(31, h) + tag.charCodeAt(i)) | 0
  }
  const hue = Math.abs(h) % 360
  return `hsl(${hue} 48% 88%)`
}

export function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/** Text color that reads on a #rrggbb background. */
export function readableOnHex(bgHex: string): '#111111' | '#ffffff' {
  const rgb = parseHex(bgHex)
  if (!rgb) return '#111111'
  const L = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return L > 0.55 ? '#111111' : '#ffffff'
}

export function fallbackFriendColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) {
    h = (Math.imul(31, h) + name.charCodeAt(i)) | 0
  }
  const hue = Math.abs(h) % 360
  return `hsl(${hue} 45% 42%)`
}
