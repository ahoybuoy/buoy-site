// Shared plumbing for the Realistic wave styles (moonlit-sea, glass-water, storm-chop,
// caustics, swell-lines). Contract: ../WAVES.md.
// - One height function for the boat's swell line, evaluated identically in JS and GLSL,
//   so root.buoySurface(x) matches the drawn water exactly.
// - Canvas sizing (DPR <= 2), pause off screen / hidden tab, static frame under reduced motion.

import { createWaveClock, waveEnvelope, type WaveParams } from '../params'

export type Wave = { len: number; amp: number; speed: number; phase: number }

/** Shared live parameters (../params.ts). chop 0.3 and intensity 1 give each style's own look. */
export const NEUTRAL: WaveParams = { intensity: 1, speed: 1, chop: 0.3, variation: 0.3 }
/** Crest sharpness: peaky crest profile, steeper with chop. Mirrored in GLSL. */
export const sharpOf = (p: WaveParams) => Math.max(1, 1.6 + (p.chop - 0.3) * 0.7)
/** Per-wave gain: chop moves energy into the shorter waves (index 1..3) */
export const gainOf = (p: WaveParams, i: number) => p.intensity * Math.max(0.15, 1 + (p.chop - 0.3) * 1.4 * (i / 3))

export const seaScale = (w: number) => Math.min(1, Math.max(0.55, w / 1200))

/** Water line offset from the mean line in px (negative = up) */
export function waveHeight(waves: Wave[], x: number, t: number, scale: number, p: WaveParams = NEUTRAL) {
  let y = 0
  const sh = sharpOf(p)
  waves.forEach((wv, i) => {
    const th = ((Math.PI * 2) / wv.len) * (x - wv.speed * t) + wv.phase
    y -= wv.amp * scale * gainOf(p, i) * (2 * Math.pow(0.5 + 0.5 * Math.cos(th), sh) - 1)
  })
  return y * waveEnvelope(x, t, p.variation)
}

/** vec4 per wave: (k, amp px, speed px/s, phase), scale applied */
export function wavesUniform(waves: Wave[], scale: number, p: WaveParams = NEUTRAL, n = 4) {
  const a = new Float32Array(n * 4)
  waves.slice(0, n).forEach((wv, i) => a.set([(Math.PI * 2) / wv.len, wv.amp * scale * gainOf(p, i), wv.speed, wv.phase], i * 4))
  return a
}

/** Set the GLSL_HEIGHT uniforms for this frame */
export function glSea(q: { v4: (n: string, v: Float32Array) => void; f1: (n: string, v: number) => void }, waves: Wave[], s: SeaState) {
  q.v4('u_waves[0]', wavesUniform(waves, s.scale, s.p))
  q.f1('u_sharp', sharpOf(s.p))
  q.f1('u_var', s.p.variation)
}

/** GLSL mirror of waveHeight. Needs uniform vec4 u_waves[4] and float u_t. */
export const GLSL_HEIGHT = /* glsl */ `
uniform vec4 u_waves[4];
uniform float u_sharp, u_var;
// mirror of params.ts waveEnvelope
float seaEnv(float x) {
  if (u_var <= 0.0) return 1.0;
  float g = 0.6 * sin(6.2831853 * (x / 1700.0 - u_t / 10.5)) + 0.4 * sin(6.2831853 * (u_t / 7.3) + 1.1);
  return max(0.12, 1.0 + u_var * 0.75 * g);
}
float seaH(float x) {
  float y = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 w = u_waves[i];
    float th = w.x * (x - w.z * u_t) + w.w;
    y -= w.y * (2.0 * pow(0.5 + 0.5 * cos(th), u_sharp) - 1.0);
  }
  return y * seaEnv(x);
}
`

/** Resolve a CSS colour (var(), color-mix(), oklch...) to [r,g,b] 0..1 via a 1px canvas */
export function colorReader(host: HTMLElement) {
  const cv = document.createElement('canvas')
  cv.width = cv.height = 1
  const c = cv.getContext('2d', { willReadFrequently: true })!
  const probe = document.createElement('span')
  probe.style.display = 'none'
  host.appendChild(probe)
  const cs = getComputedStyle(host)
  const read = (name: string, fallback: string) => {
    probe.style.color = ''
    probe.style.color = cs.getPropertyValue(name).trim() || fallback
    const css = getComputedStyle(probe).color || fallback
    c.clearRect(0, 0, 1, 1)
    c.fillStyle = fallback
    c.fillStyle = css
    c.fillRect(0, 0, 1, 1)
    const d = c.getImageData(0, 0, 1, 1).data
    return { css, rgb: [d[0] / 255, d[1] / 255, d[2] / 255] as [number, number, number] }
  }
  return { read, done: () => probe.remove() }
}

export interface SeaState {
  w: number
  h: number
  dpr: number
  /** Mean water line (px from the top of the root) */
  waterY: number
  scale: number
  /** Eased live parameters for this frame */
  p: WaveParams
}

export interface SeaOptions {
  /** The swell the boat rides */
  waves: Wave[]
  /** Called on resize (canvas already sized) and when colours change */
  setup: (s: SeaState) => void
  readColors: () => void
  draw: (t: number, s: SeaState) => void
  /** Time shown under reduced motion */
  stillT?: number
  /** Optional change to the sampled line (e.g. a breaking lip): returns the outer water y at x */
  envelope?: (x: number, y: number, t: number) => number
  /** Backing-store scale on top of DPR (soft shaders can render below 1) */
  renderScale?: number
}

export function mountSea(root: HTMLElement, canvas: HTMLCanvasElement, opt: SeaOptions) {
  const surface = root.querySelector<HTMLElement>('.wave-container-1')!
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  let last = opt.stillT ?? 4
  // Wave clock (params.ts): style time advances by dt * speed, params ease; renderer and
  // sampler read the same frame via clock.at(document.timeline.currentTime)
  const clock = createWaveClock(root, {}, last)
  const s: SeaState = { w: 0, h: 0, dpr: 1, waterY: 0, scale: 1, p: clock.params }

  const resize = () => {
    const r = root.getBoundingClientRect()
    s.dpr = Math.min(2, window.devicePixelRatio || 1) * (opt.renderScale ?? 1)
    s.w = Math.max(1, Math.round(r.width))
    s.h = Math.max(1, Math.round(r.height))
    canvas.width = Math.round(s.w * s.dpr)
    canvas.height = Math.round(s.h * s.dpr)
    s.waterY = surface.offsetTop
    s.scale = seaScale(s.w)
    opt.setup(s)
    opt.draw(last, s)
  }

  let raf = 0, visible = true
  clock.setRunning(() => raf !== 0)
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop)
    last = clock.at(now).t
    opt.draw(last, s)
  }
  const run = () => {
    cancelAnimationFrame(raf)
    raf = 0
    if (reduced.matches) { opt.draw(last, s); return }
    if (visible && !document.hidden) raf = requestAnimationFrame(loop)
  }

  // Surface sampler (WAVES.md): the boat's swell at the time of the frame being drawn
  const frameT = () => (raf ? clock.at(document.timeline.currentTime as number).t : last)
  ;(root as any).buoySurface = (x: number, aheadMs = 0) => {
    const t = aheadMs ? clock.ahead(aheadMs) : frameT()
    const y0 = (xx: number) => s.waterY + waveHeight(opt.waves, xx, t, s.scale, s.p)
    const y = opt.envelope ? (xx: number) => opt.envelope!(xx, y0(xx), t) : y0
    return { y: y(x), slope: (y(x + 2) - y(x - 2)) / 4 }
  }

  // inspection only: draw a given time (used by the screenshot tools under reduced motion)
  ;(root as any).__seaDraw = (t: number) => { last = t; opt.draw(t, s) }
  opt.readColors()
  resize()
  new ResizeObserver(resize).observe(root)
  new IntersectionObserver((e) => { visible = e.some((x) => x.isIntersecting); run() }).observe(root)
  document.addEventListener('visibilitychange', run)
  reduced.addEventListener('change', run)
  new MutationObserver(() => { opt.readColors(); opt.draw(last, s) }).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] })
  run()
}

/** Minimal full-screen-quad WebGL program */
export function glQuad(canvas: HTMLCanvasElement, frag: string) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false })
  if (!gl) return null
  const sh = (type: number, src: string) => {
    const o = gl.createShader(type)!
    gl.shaderSource(o, src)
    gl.compileShader(o)
    if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(o))
    return o
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }'))
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, 'precision highp float;\nuniform float u_t;\n' + frag))
  gl.linkProgram(prog)
  gl.useProgram(prog)
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const cache: Record<string, WebGLUniformLocation | null> = {}
  const u = (n: string) => (n in cache ? cache[n] : (cache[n] = gl.getUniformLocation(prog, n)))
  return {
    gl,
    f1: (n: string, v: number) => gl.uniform1f(u(n), v),
    f2: (n: string, a: number, b: number) => gl.uniform2f(u(n), a, b),
    f3: (n: string, v: number[]) => gl.uniform3f(u(n), v[0], v[1], v[2]),
    v4: (n: string, v: Float32Array) => gl.uniform4fv(u(n), v),
    draw: () => { gl.viewport(0, 0, canvas.width, canvas.height); gl.drawArrays(gl.TRIANGLES, 0, 3) },
  }
}

/** Shared GLSL helpers: pixel -> CSS px with y down from the top */
export const GLSL_COMMON = /* glsl */ `
uniform vec2 u_res;   // css px
uniform float u_dpr;
uniform float u_water; // mean water line, css px from top
float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 cssPx() { return vec2(gl_FragCoord.x, u_res.y * u_dpr - gl_FragCoord.y) / u_dpr; }
`
