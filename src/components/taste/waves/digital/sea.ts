// Shared runtime for the Digital wave styles (mesh-sea, halftone, ascii-ocean,
// oscilloscope, contour-flow). Contract: ../WAVES.md.
import { createWaveClock, waveEnvelope, type WaveParams } from '../params'
// One height field drives every style: field(x, z, t) in px (negative = up), where
// z is world distance back from the front surface (0 = the line the boat rides).

export type Wave = { len: number; amp: number; speed: number; ph: number; kz: number }

/** Front swell set. kz tilts each crest line so the field varies with depth. */
export const WAVES: Wave[] = [
  { len: 760, amp: 13, speed: 62, ph: 0.4, kz: 0.35 },
  { len: 340, amp: 6.5, speed: 80, ph: 2.1, kz: -0.55 },
  { len: 175, amp: 3, speed: 96, ph: 4.0, kz: 0.8 },
  { len: 1100, amp: 5, speed: 30, ph: 1.3, kz: 1.6 },
]

export const ampScale = (w: number) => Math.min(1, Math.max(0.6, w / 1200))

/** Live parameters (params.ts) for the frame being drawn or sampled. mount() sets this
 *  from the style's clock right before every draw and every sampler call. */
export const P: WaveParams = { intensity: 1, speed: 1, chop: 0.3, variation: 0.3 }

export function field(x: number, z: number, t: number, scale: number, waves = WAVES) {
  // chop: shorter waves (0.3 = the original lengths) and a Stokes-like 2nd harmonic
  // that peaks the crests and flattens the troughs
  const ls = 1.15 - 0.5 * P.chop
  const h2 = 0.12 + 0.4 * P.chop
  let y = 0
  for (const wv of waves) {
    const k = (Math.PI * 2) / (wv.len * ls)
    const th = k * (x - wv.speed * t) + k * wv.kz * z + wv.ph
    y -= wv.amp * scale * (Math.cos(th) + h2 * Math.cos(2 * th))
  }
  return y * P.intensity * waveEnvelope(x, t, P.variation)
}

export type Frame = {
  ctx: CanvasRenderingContext2D
  w: number; h: number; dpr: number
  waterY: number; t: number; scale: number; mobile: boolean
  c: Record<string, string>
}

export interface Style {
  colors: Record<string, [string, string]>
  /** Called after resize (and colour changes) */
  setup?(f: Frame): void
  draw(f: Frame): void
  /** y of the drawn surface at x for time t (must match draw exactly) */
  surface(x: number, f: Frame, t: number): number
  /** Optional slope (dy/dx) for the tilt, if it should be smoother than the height */
  slope?(x: number, f: Frame, t: number): number
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

export function mount(root: HTMLElement, style: Style) {
  if (root.dataset.init) return
  root.dataset.init = '1'
  const canvas = root.querySelector('canvas')!
  const marker = root.querySelector<HTMLElement>('.wave-container-1')!
  const ctx = canvas.getContext('2d')!
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const f: Frame = { ctx, w: 0, h: 0, dpr: 1, waterY: 0, t: 4, scale: 1, mobile: false, c: {} }

  const readColors = () => {
    const r = resolver(root)
    for (const [k, [v, fb]] of Object.entries(style.colors)) f.c[k] = r.get(v, fb)
    r.done()
  }
  const draw = () => {
    if (!f.w) return
    if (!raf) f.t = sync(performance.now())
    ctx.setTransform(f.dpr, 0, 0, f.dpr, 0, 0)
    ctx.clearRect(0, 0, f.w, f.h)
    ctx.globalAlpha = 1
    style.draw(f)
  }
  const resize = () => {
    const r = root.getBoundingClientRect()
    f.dpr = Math.min(2, window.devicePixelRatio || 1)
    f.w = Math.max(1, Math.round(r.width))
    f.h = Math.max(1, Math.round(r.height))
    canvas.width = Math.round(f.w * f.dpr)
    canvas.height = Math.round(f.h * f.dpr)
    f.waterY = marker.offsetTop
    f.scale = ampScale(f.w)
    f.mobile = f.w < 768
    style.setup?.(f)
    draw()
  }

  let raf = 0, visible = true
  const clock = createWaveClock(root, {}, 4)
  clock.setRunning(() => raf !== 0)
  const sync = (now: number) => { const fr = clock.at(now); Object.assign(P, fr.p); return fr.t }
  const loop = (now: number) => {
    f.t = sync(now)
    draw()
    raf = requestAnimationFrame(loop)
  }
  const run = () => {
    cancelAnimationFrame(raf)
    raf = 0
    if (reduced.matches) { f.t = sync(performance.now()); draw(); return }
    if (visible && !document.hidden) raf = requestAnimationFrame(loop)
  }

  // Surface sampler (WAVES.md): same clock, same eased params as the frame being drawn.
  ;(root as any).buoySurface = (x: number, aheadMs = 0) => {
    sync(document.timeline.currentTime as number)
    const t = aheadMs ? clock.ahead(aheadMs) : clock.at(document.timeline.currentTime as number).t
    const y = style.surface(x, f, t)
    return { y, slope: style.slope ? style.slope(x, f, t) : (style.surface(x + 2, f, t) - style.surface(x - 2, f, t)) / 4 }
  }

  readColors()
  resize()
  new ResizeObserver(resize).observe(root)
  new IntersectionObserver((e) => { visible = e.some((x) => x.isIntersecting); run() }).observe(root)
  document.addEventListener('visibilitychange', run)
  reduced.addEventListener('change', run)
  new MutationObserver(() => { readColors(); style.setup?.(f); draw() }).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] })
  run()
}

export const smooth = (a: number, b: number, x: number) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u) }
