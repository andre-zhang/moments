/** Tiny “saved” chirp — Web Audio, no external file */
export function playSaveChirp(): void {
  try {
    const ctx = new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g)
    g.connect(ctx.destination)
    o.type = 'sine'
    o.frequency.setValueAtTime(880, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.06)
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14)
    o.start(ctx.currentTime)
    o.stop(ctx.currentTime + 0.15)
    ctx.resume()
  } catch {
    /* ignore */
  }
}
