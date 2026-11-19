import { createWaveClock, waveEnvelope, type WaveParams } from '../params'
// Shared plumbing for the Experimental wave styles (flow-field, liquid-chrome,
// ink-water, aurora-sea, code-sea). Lifecycle, colours, the swell function the
// boat rides (mirrored exactly in the shaders) and a tiny WebGL helper.

/** One swell component: wavelength px, amplitude px (at 1200px wide), speed px/s, phase */
export type Swell = [len: number, amp: number, speed: number, phase: number]

export const swellScale = (w: number) => Math.min(1, Math.max(0.55, w / 1200))

export type P = WaveParams
// Short waves that chop adds (len, amp at chop=1, speed, phase)
const CHOP: Swell[] = [[150, 3.6, 92, 1.3], [84, 1.3, 108, 4.2]]

/**
 * Height offset (px, +down) of the swell at x, style time t, with the live params:
 * intensity scales amplitude, variation rolls wave sets through (waveEnvelope), chop adds
 * short waves and sharpens crests / flattens troughs. Shaders use the same maths (GLSL_SWELL).
 */
export function swellAt(waves: Swell[], x: number, t: number, w: number, p: P) {
  const s = swellScale(w) * p.intensity * waveEnvelope(x, t, p.variation)
  let y = 0, A = 0
  for (const [len, amp, speed, ph] of waves) { y += amp * Math.sin((Math.PI * 2 / len) * (x - speed * t) + ph); A += amp }
  for (const [len, amp, speed, ph] of CHOP) y += amp * p.chop * Math.sin((Math.PI * 2 / len) * (x - speed * t) + ph)
  A += 4.9 * p.chop
  y -= p.chop * 0.45 * (y * y) / A
  return y * s
}

/** GLSL source of the same function: float swell(float x) using uniforms uW[4] (len,amp,speed,phase), uScale, uT */
export const GLSL_SWELL = `
uniform vec4 uW[4];
uniform float uScale; // swellScale * intensity
uniform float uChop;
uniform float uVar;
uniform float uT;
uniform float uWaterY;
uniform vec2 uRes; // css px
uniform float uDpr;
float envelope(float x){
  if (uVar <= 0.0) return 1.0;
  float g = 0.6 * sin(6.283185307 * (x / 1700.0 - uT / 10.5)) + 0.4 * sin(6.283185307 * (uT / 7.3) + 1.1);
  return max(0.12, 1.0 + uVar * 0.75 * g);
}
float swell(float x){
  float y = 0.0, A = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 w = uW[i];
    if (w.x <= 0.0) continue;
    y += w.y * sin(6.283185307 / w.x * (x - w.z * uT) + w.w);
    A += w.y;
  }
  y += 3.6 * uChop * sin(6.283185307 / 150.0 * (x - 92.0 * uT) + 1.3);
  y += 1.3 * uChop * sin(6.283185307 / 84.0 * (x - 108.0 * uT) + 4.2);
  A += 4.9 * uChop;
  y -= uChop * 0.45 * (y * y) / A;
  return y * uScale * envelope(x);
}
float surfaceY(float x){ return uWaterY + swell(x); }
`

/** Resolve CSS custom property colours on the root to [r,g,b] 0..1 (handles color-mix/oklch). */
export function colorReader(root: HTMLElement) {
  const c = document.createElement('canvas')
  c.width = c.height = 1
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  const probe = document.createElement('span')
  probe.style.display = 'none'
  return (name: string, fallback: string): [number, number, number] => {
    root.appendChild(probe)
    probe.style.color = ''
    probe.style.color = getComputedStyle(root).getPropertyValue(name).trim() || fallback
    const css = getComputedStyle(probe).color || fallback
    probe.remove()
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = fallback
    ctx.fillStyle = css
    ctx.fillRect(0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    return [d[0] / 255, d[1] / 255, d[2] / 255]
  }
}
export const rgb = (c: number[], a = 1) => `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`

export interface Host {
  w: number
  h: number
  dpr: number
  waterY: number
  /** Live wave params (eased) for the current frame */
  p: P
  /** Time (s) of the frame being drawn / about to be drawn */
  frameT(): number
}

/**
 * Run a style: sizes the canvas (DPR <= 2), loops on rAF while on screen and the tab
 * is visible, draws one static frame under reduced motion, re-reads colours on theme
 * changes, and installs root.buoySurface from the given swell.
 */
export function run(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  opts: {
    waves: Swell[]
    /** water line as a fraction of the root height */
    water?: number
    staticT?: number
    /** render resolution relative to the (capped) DPR, for soft shaders */
    res?: number
    colors(): void
    resize?(host: Host): void
    draw(t: number, dt: number, host: Host): void
  },
) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const surface = root.querySelector<HTMLElement>('.wave-container-1')
  let raf = 0, visible = true
  const clock = createWaveClock(root, {}, opts.staticT ?? 6)
  clock.setRunning(() => raf !== 0)
  const now = () => document.timeline.currentTime as number
  const host: Host = {
    w: 0, h: 0, dpr: 1, waterY: 0, p: clock.params,
    frameT: () => clock.at(now()).t,
  }
  const still = () => opts.draw(clock.at(now()).t, 0, host)
  const resize = () => {
    const r = root.getBoundingClientRect()
    host.dpr = Math.min(2, window.devicePixelRatio || 1) * (opts.res ?? 1)
    host.w = Math.max(1, Math.round(r.width))
    host.h = Math.max(1, Math.round(r.height))
    canvas.width = Math.round(host.w * host.dpr)
    canvas.height = Math.round(host.h * host.dpr)
    host.waterY = surface ? surface.offsetTop : Math.round(host.h * (opts.water ?? 0.55))
    opts.resize?.(host)
    still()
  }
  let prev = 0
  const loop = (ts: number) => {
    raf = requestAnimationFrame(loop)
    const f = clock.at(ts)
    const dt = prev ? Math.min(0.05, (ts - prev) / 1000) * f.p.speed : 0.016
    prev = ts
    opts.draw(f.t, dt, host)
  }
  const go = () => {
    cancelAnimationFrame(raf)
    raf = 0
    prev = 0
    if (reduced.matches) { still(); return }
    if (visible && !document.hidden) raf = requestAnimationFrame(loop)
  }
  ;(root as any).buoySurface = (x: number, aheadMs = 0) => {
    clock.at(now())
    const t = aheadMs ? clock.ahead(aheadMs) : clock.at(now()).t
    const p = host.p
    const y = host.waterY + swellAt(opts.waves, x, t, host.w, p)
    const slope = (swellAt(opts.waves, x + 2, t, host.w, p) - swellAt(opts.waves, x - 2, t, host.w, p)) / 4
    return { y, slope }
  }
  opts.colors()
  resize()
  new ResizeObserver(resize).observe(root)
  new IntersectionObserver((e) => { visible = e.some((x) => x.isIntersecting); go() }).observe(root)
  document.addEventListener('visibilitychange', go)
  reduced.addEventListener('change', go)
  new MutationObserver(() => { opts.colors(); still() }).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] })
  go()
  return host
}

// ---- WebGL (fullscreen triangle + one fragment shader) ----
export function glPass(canvas: HTMLCanvasElement, frag: string) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false })
  if (!gl) return null
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s))
    return s
  }
  const p = gl.createProgram()!
  gl.attachShader(p, sh(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'))
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, 'precision highp float;\n' + GLSL_SWELL + frag))
  gl.linkProgram(p)
  gl.useProgram(p)
  const b = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, b)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(p, 'a')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const cache: Record<string, WebGLUniformLocation | null> = {}
  const u = (n: string) => (n in cache ? cache[n] : (cache[n] = gl.getUniformLocation(p, n)))
  return {
    gl,
    f1: (n: string, v: number) => gl.uniform1f(u(n), v),
    f2: (n: string, a: number, b: number) => gl.uniform2f(u(n), a, b),
    f3: (n: string, c: number[]) => gl.uniform3f(u(n), c[0], c[1], c[2]),
    swell(waves: Swell[], t: number, host: Host) {
      const arr = new Float32Array(16)
      waves.slice(0, 4).forEach((wv, i) => arr.set(wv, i * 4))
      gl.uniform4fv(u('uW'), arr)
      gl.uniform1f(u('uScale'), swellScale(host.w) * host.p.intensity)
      gl.uniform1f(u('uChop'), host.p.chop)
      gl.uniform1f(u('uVar'), host.p.variation)
      gl.uniform1f(u('uT'), t)
      gl.uniform1f(u('uWaterY'), host.waterY)
      gl.uniform2f(u('uRes'), host.w, host.h)
      gl.uniform1f(u('uDpr'), host.dpr)
    },
    draw() {
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
  }
}

/** css-px coordinates of the fragment, y down */
export const GLSL_PX = `vec2 px(){ return vec2(gl_FragCoord.x / uDpr, uRes.y - gl_FragCoord.y / uDpr); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
  return mix(mix(hash12(i), hash12(i+vec2(1,0)), u.x), mix(hash12(i+vec2(0,1)), hash12(i+vec2(1,1)), u.x), u.y); }
float fbm(vec2 p){ float s = 0., a = .5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 5; i++){ s += a * vnoise(p); p = m * p; a *= .5; } return s; }
`
