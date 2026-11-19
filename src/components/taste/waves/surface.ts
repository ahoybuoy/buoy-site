// Surface samplers (contract: ./WAVES.md, "Surface sampler").
// root.buoySurface(xPx) -> { y, slope }: the water line in px from the top of the
// .wave-background at that x, for the frame being drawn, and dy/dx there.

export type Surface = (x: number, aheadMs?: number) => { y: number; slope: number }

/**
 * Sampler for an SVG wave path that a CSS animation scrolls sideways (the live
 * WaveBackground). Reads the path geometry once into a lookup table (viewBox units),
 * then each call adds the container's current animated translateX.
 * The path must be a filled wave: top edge first, closed along the bottom.
 */
export function svgPathSurface(root: HTMLElement, containerSel: string, ampK: () => number = () => 1): Surface | null {
  const box = root.querySelector<HTMLElement>(containerSel)
  const svg = box?.querySelector('svg')
  const path = svg?.querySelector('path')
  if (!box || !svg || !path) return null
  const vb = svg.viewBox.baseVal
  // Top edge as y per viewBox x (1 unit steps). The path runs along the crest line
  // from x=0 to x=W first; walk it until it reaches the right edge and fill every
  // unit between consecutive samples (the closing edges are never read).
  const W = Math.round(vb.width)
  const top = new Float32Array(W + 1)
  const len = path.getTotalLength()
  const n = Math.ceil(len)
  let px = -1, py = 0
  for (let i = 0; i <= n; i++) {
    const p = path.getPointAtLength((i / n) * len)
    const x = p.x - vb.x
    if (px >= 0 && x > px) {
      for (let xi = Math.ceil(px); xi <= Math.min(W, Math.floor(x)); xi++) top[xi] = py + (p.y - py) * ((xi - px) / (x - px))
    }
    if (px < 0) top[0] = p.y
    if (px < 0 || x > px) { px = x; py = p.y }
    if (x >= W - 0.001) break
  }
  const mean = top[0]
  const yAt = (vx: number) => {
    vx = ((vx % W) + W) % W
    const i = Math.floor(vx), f = vx - i
    return mean + (top[i] * (1 - f) + top[Math.min(W, i + 1)] * f - mean) * ampK()
  }
  // Scroll speed of the CSS loop (translateX 0 -> -50% per iteration), for look-ahead
  const speed = () => {
    const a = box.getAnimations()[0]
    const d = Number(a?.effect?.getComputedTiming().duration) || 0
    if (!a || !d || a.playState !== 'running') return 0
    const rev = /reverse/.test(String(a.effect?.getComputedTiming().direction)) ? -1 : 1
    return (-box.offsetWidth / 2 / d) * rev * (a.playbackRate || 1)
  }
  return (x: number, aheadMs = 0) => {
    const m = getComputedStyle(box).transform
    const tx = (m === 'none' ? 0 : new DOMMatrix(m).e) + (aheadMs ? speed() * aheadMs : 0)
    const sx = vb.width / box.offsetWidth
    const sy = box.offsetHeight / vb.height
    const vx = (x - box.offsetLeft - tx) * sx + vb.x
    const y = box.offsetTop + (yAt(vx) - vb.y) * sy
    const slope = ((yAt(vx + 2) - yAt(vx - 2)) / 4) * sy * sx
    return { y, slope }
  }
}

/**
 * Live params (params.ts) for an SVG sea whose wave paths scroll by CSS (the live
 * WaveBackground), applied from outside: speed -> playbackRate of each container's
 * animation; intensity x variation -> the paths' amplitude around their mean line (the
 * d attribute is rewritten only when it changes, so the defaults cost nothing).
 * Chop is a no-op here. Returns the current amplitude factor for svgPathSurface.
 */
import { createWaveClock, waveEnvelope } from './params'
export function driveSvgSea(root: HTMLElement, containerSel = '.wave-container') {
  const clock = createWaveClock(root, { chop: 0, variation: 0 })
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  clock.setRunning(() => !document.hidden && !reduced.matches)
  const paths = Array.from(root.querySelectorAll<SVGPathElement>(`${containerSel} path`)).map((el) => {
    const d0 = el.getAttribute('d') || ''
    const nums = d0.match(/-?\d*\.?\d+/g)?.map(Number) || []
    return { el, d0, mean: nums[1] ?? 0 }
  })
  const boxes = Array.from(root.querySelectorAll<HTMLElement>(containerSel))
  let k = 1, applied = 1, rate = 1
  const frame = (now: number) => {
    requestAnimationFrame(frame)
    const f = clock.at(now)
    k = f.p.intensity * waveEnvelope(0, f.t, f.p.variation)
    if (Math.abs(k - applied) > 0.002) {
      applied = k
      for (const p of paths) {
        let i = 0
        p.el.setAttribute('d', Math.abs(k - 1) < 0.002 ? p.d0 : p.d0.replace(/-?\d*\.?\d+/g, (m) => {
          const isY = i++ % 2 === 1
          const v = Number(m)
          return isY && v < 799 ? (p.mean + (v - p.mean) * k).toFixed(2) : m
        }))
      }
    }
    if (Math.abs(f.p.speed - rate) > 0.002) {
      rate = f.p.speed
      for (const b of boxes) for (const a of b.getAnimations()) a.playbackRate = rate
    }
  }
  requestAnimationFrame(frame)
  return () => applied
}
