// Shared engine for the Logomark wave styles (contract: ../WAVES.md).
// A field of whole Buoy marks on a grid. Each style supplies:
//   H(x, t)            water height offset in px at screen x (negative = up). The implied surface
//                      is waterY + H(x, t); the front row of marks sits with its top edge on it.
//   mark(m, t)         per mark: size 0..1, alpha 0..1, dy (px, small vertical offset), hi (0..1 highlight)
// The mark geometry is the brand mark from src/scripts/markPatterns.js (one corner piece turned four
// times, identical to BuoyMark.astro); it is never redrawn or split, only scaled and faded whole.

import { createWaveClock, waveEnvelope, type WaveParams } from '../params'

const PIECE = 'M22.8 2H26A12 12 0 0 1 38 14V17.2H29V17A6 6 0 0 0 23 11H22.8Z'
function markPath() {
  const mark = new Path2D()
  const piece = new Path2D(PIECE)
  for (let k = 0; k < 4; k++) mark.addPath(piece, new DOMMatrix().translate(20, 20).rotate(k * 90).translate(-20, -20))
  return mark
}

export type Cell = {
  i: number; j: number
  /** rest centre, px */
  x: number; y: number
  /** depth below the rest water line in px (row 0 = front row = 0) */
  d: number
  /** cell size for this mark (px), the max mark size */
  cell: number
  /** free per-style data */
  z?: number; X?: number
}
export type MarkOut = { s: number; a: number; dy: number; hi: number; /** dy is final (not scaled by intensity) */ abs?: boolean }
export type Ctx = {
  w: number; h: number; waterY: number; cell: number
  /** boat centre x in root px, or null when the boat is not on the water */
  boatX: number | null
  /** Live eased params (WAVES.md "Parameters") */
  p: WaveParams
  /** Full surface offset at x (style H scaled by intensity and wave groups, plus chop) */
  S: (x: number, t: number) => number
}
export type Style = {
  /** Lay out the grid (default: front row on the water line, rows below to the bottom) */
  layout?: (c: Ctx) => Cell[]
  /** Called once per frame before marks are evaluated */
  frame?: (t: number, c: Ctx, dt: number) => void
  H: (x: number, t: number, c: Ctx) => number
  mark: (m: Cell, t: number, c: Ctx, out: MarkOut) => void
  /** The boat landed on the water at x */
  onLand?: (x: number, t: number, c: Ctx) => void
  cell?: (w: number) => number
  /** Front-row marks ride the surface (dy = H) - default true */
  frontRides?: boolean
}

function resolver(host: HTMLElement) {
  const probe = document.createElement('span')
  probe.style.display = 'none'
  host.appendChild(probe)
  const cs = getComputedStyle(host)
  const get = (name: string, fallback: string) => {
    probe.style.color = ''
    probe.style.color = cs.getPropertyValue(name).trim() || fallback
    return getComputedStyle(probe).color || fallback
  }
  return { get, done: () => probe.remove() }
}

export function defaultLayout(c: Ctx): Cell[] {
  const cells: Cell[] = []
  const cols = Math.ceil(c.w / c.cell) + 1
  const ox = (c.w - (cols - 1) * c.cell) / 2
  for (let j = 0; c.waterY + c.cell * 0.5 + j * c.cell < c.h + c.cell; j++) {
    for (let i = 0; i < cols; i++) {
      cells.push({ i, j, x: ox + i * c.cell, y: c.waterY + j * c.cell, d: j * c.cell, cell: c.cell })
    }
  }
  return cells
}

export function mountMarkSea(root: HTMLElement, style: Style) {
  const canvas = root.querySelector('canvas')!
  const marker = root.querySelector<HTMLElement>('.wave-container-1')!
  const g = canvas.getContext('2d')!
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const SPR = 96
  const sprites: HTMLCanvasElement[] = []
  const clock = createWaveClock(root, { chop: 0.2, variation: 0.3 }, 3)
  const mob = () => (c.w < 600 ? 0.7 : 1)
  const chopH = (x: number, t: number) => {
    const k = c.p.chop
    if (k < 0.01) return 0
    return -k * mob() * (2.4 * Math.sin(x * 0.058 - t * 3.4 + 0.7) + 1.1 * Math.sin(x * 0.103 + t * 2.6 + 2.1) + 0.5 * Math.sin(x * 0.16 - t * 4.3))
  }
  const c: Ctx = {
    w: 0, h: 0, waterY: 0, cell: 22, boatX: null, p: clock.params,
    S: (x, t) => c.p.intensity * waveEnvelope(x, t, c.p.variation) * style.H(x, t, c) + c.p.intensity * chopH(x, t),
  }
  let cells: Cell[] = [], dpr = 1
  const out: MarkOut = { s: 0, a: 0, dy: 0, hi: 0 }

  function makeSprites() {
    const r = resolver(root)
    const tones = [r.get('--mark-base', '#6b8fb8'), r.get('--mark-hi', '#e6f2ff')]
    r.done()
    const path = markPath()
    sprites.length = 0
    for (const tone of tones) {
      const s = document.createElement('canvas')
      s.width = s.height = SPR
      const sg = s.getContext('2d')!
      sg.scale(SPR / 36, SPR / 36)
      sg.translate(-2, -2) // the mark spans 2..38 of its 40 box
      sg.fillStyle = tone
      sg.fill(path)
      sprites.push(s)
    }
  }

  function resize() {
    const r = root.getBoundingClientRect()
    dpr = Math.min(2, window.devicePixelRatio || 1)
    c.w = Math.max(1, Math.round(r.width))
    c.h = Math.max(1, Math.round(r.height))
    canvas.width = Math.round(c.w * dpr)
    canvas.height = Math.round(c.h * dpr)
    c.waterY = marker.offsetTop
    c.cell = style.cell ? style.cell(c.w) : Math.round(c.w < 600 ? 17 : 22)
    cells = (style.layout || defaultLayout)(c)
    draw(last, 0)
  }

  // Boat tracking (for splashes and wakes)
  const sea = root.parentElement
  let boat: HTMLElement | null = null, wasOn = false
  function trackBoat(t: number) {
    boat = boat || (sea?.querySelector<HTMLElement>('[data-wave-boat]') ?? null)
    if (!boat) { c.boatX = null; return }
    const on = (boat.classList.contains('visible') || boat.classList.contains('launching')) && boat.style.top === ''
    if (on) {
      const br = boat.getBoundingClientRect(), rr = root.getBoundingClientRect()
      c.boatX = br.left + br.width / 2 - rr.left
      if (!wasOn) style.onLand?.(c.boatX, t, c)
    } else c.boatX = null
    wasOn = on
  }

  function draw(t: number, dt: number) {
    if (!c.w || !sprites.length) return
    style.frame?.(t, c, dt)
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.clearRect(0, 0, canvas.width, canvas.height)
    const rides = style.frontRides !== false
    for (const m of cells) {
      out.s = 0.5; out.a = 0.5; out.dy = 0; out.hi = 0
      out.abs = false
      style.mark(m, t, c, out)
      if (!out.abs) out.dy = out.dy * c.p.intensity * waveEnvelope(m.x, t, c.p.variation) + c.p.intensity * chopH(m.x, t) * Math.exp(-m.d / 45)
      if (out.a <= 0.01 || out.s <= 0.02) continue
      const s = m.cell * out.s
      // front row: top edge on the surface
      const y = rides && m.j === 0 ? c.waterY + c.S(m.x, t) + s / 2 : m.y + m.cell * 0.5 + out.dy
      const px = (m.x - s / 2) * dpr, py = (y - s / 2) * dpr, ps = s * dpr
      g.globalAlpha = Math.min(1, out.a * (1 - out.hi))
      g.drawImage(sprites[0], px, py, ps, ps)
      if (out.hi > 0.01) {
        g.globalAlpha = Math.min(1, out.a * out.hi)
        g.drawImage(sprites[1], px, py, ps, ps)
      }
    }
    g.globalAlpha = 1
  }

  let raf = 0, visible = true, last = 3
  clock.setRunning(() => !!raf && visible && !document.hidden && !reduced.matches)
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop)
    const prev = last
    last = clock.at(now).t
    trackBoat(last)
    draw(last, Math.max(0, last - prev))
  }
  const run = () => {
    cancelAnimationFrame(raf)
    raf = 0
    if (reduced.matches) { draw(last, 0); return }
    if (visible && !document.hidden) raf = requestAnimationFrame(loop)
  }

  // Surface sampler (WAVES.md): the implied water line for the frame being drawn
  ;(root as any).buoySurface = (x: number, aheadMs = 0) => {
    let t = raf ? clock.at(document.timeline.currentTime as number).t : last
    if (aheadMs) t = clock.ahead(aheadMs)
    return { y: c.waterY + c.S(x, t), slope: (c.S(x + 2, t) - c.S(x - 2, t)) / 4 }
  }

  makeSprites()
  resize()
  new ResizeObserver(resize).observe(root)
  new IntersectionObserver((e) => { visible = e.some((x) => x.isIntersecting); run() }).observe(root)
  document.addEventListener('visibilitychange', run)
  reduced.addEventListener('change', run)
  new MutationObserver(() => { makeSprites(); draw(last, 0) }).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] })
  run()
}

export const smooth = (a: number, b: number, x: number) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u) }
export const TAU = Math.PI * 2
