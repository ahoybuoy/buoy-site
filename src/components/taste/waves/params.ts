// Live wave parameters (contract: ./WAVES.md, "Parameters").
// One mechanism for every style: CSS custom properties, set on the hero (or any ancestor
// of the style root) by the viewer or a page:
//   --wave-intensity  0..2     amplitude (default 1)
//   --wave-speed      0.25..2.5 time scale (default 1)
//   --wave-chop       0..1     shorter, steeper, more harmonics (default: the style's own)
//   --wave-variation  0..1     sets: slow, travelling amplitude groups (default: the style's own, ~0.3)
// A style makes one clock and calls clock.at(document.timeline.currentTime) in BOTH its
// renderer and its surface sampler. at() is idempotent per timestamp, so both see the same
// eased parameters and the same style time t, and the boat rides exactly what is drawn.

export interface WaveParams { intensity: number; speed: number; chop: number; variation: number }
export interface WaveFrame { t: number; p: WaveParams }

const RANGES: Record<keyof WaveParams, [number, number]> = {
  intensity: [0, 2], speed: [0.25, 2.5], chop: [0, 1], variation: [0, 1],
}
const KEYS = Object.keys(RANGES) as (keyof WaveParams)[]

/** Read the four custom properties (empty = default) */
export function readWaveParams(el: Element, defaults: WaveParams): WaveParams {
  const cs = getComputedStyle(el)
  const out = { ...defaults }
  for (const k of KEYS) {
    const v = parseFloat(cs.getPropertyValue('--wave-' + k))
    if (Number.isFinite(v)) out[k] = Math.min(RANGES[k][1], Math.max(RANGES[k][0], v))
  }
  return out
}

/**
 * Wave groups: an amplitude multiplier that varies slowly in space and time, so bigger
 * sets roll through between calmer stretches (period ~10s at speed 1). Deterministic in
 * (x, t), so samplers match. Use it per sample: amp * intensity * waveEnvelope(x0, t, variation).
 */
export function waveEnvelope(x: number, t: number, variation: number) {
  if (!variation) return 1
  const g = 0.6 * Math.sin(2 * Math.PI * (x / 1700 - t / 10.5)) + 0.4 * Math.sin(2 * Math.PI * (t / 7.3) + 1.1)
  return Math.max(0.12, 1 + variation * 0.75 * g)
}

/**
 * A style's clock. t advances by dt * speed (so changing speed never jumps the phase) and
 * parameters ease toward their targets (~300ms to settle). Frozen while `running()` is
 * false (off screen, hidden tab, reduced motion).
 */
export function createWaveClock(root: Element, defaults: Partial<WaveParams> = {}, startT = 0) {
  const base: WaveParams = { intensity: 1, speed: 1, chop: 0.3, variation: 0.3, ...defaults }
  let target = readWaveParams(root, base)
  const cur = { ...target }
  let t = startT, lastNow = -1, lastRead = 0
  let running = () => true
  const frame: WaveFrame = { t, p: cur }
  return {
    /** Whether time should advance (the style sets this) */
    setRunning(fn: () => boolean) { running = fn },
    /** Style time and eased params for this frame (now = document.timeline.currentTime or a rAF timestamp) */
    at(now: number): WaveFrame {
      if (now === lastNow) return frame
      const dt = lastNow < 0 ? 0 : Math.min(0.05, Math.max(0, (now - lastNow) / 1000))
      lastNow = now
      if (now - lastRead > 150) { target = readWaveParams(root, base); lastRead = now }
      const k = 1 - Math.exp(-dt / 0.09)
      for (const key of KEYS) cur[key] += (target[key] - cur[key]) * k
      if (running()) t += dt * cur.speed
      frame.t = t
      return frame
    },
    /** Time `ms` ahead at the current speed (for look-ahead sampling) */
    ahead(ms: number) { return frame.t + (running() ? (ms / 1000) * cur.speed : 0) },
    get params() { return cur },
  }
}
