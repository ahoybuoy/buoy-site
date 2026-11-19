// The five Logomark sea styles. Each is a Style for ./engine.ts.
import { type Style, type Cell, type Ctx, smooth, TAU } from './engine'

const amp = (c: Ctx) => (c.w < 600 ? 0.7 : 1)
const fadeDepth = (m: Cell, c: Ctx) => 1 - 0.75 * smooth(0, Math.max(60, c.h - c.waterY), m.d)

// 1. Swell: travelling swells; marks swell up on the crests and settle in the troughs.
const swellWaves = [
  { len: 620, a: 13, sp: 70, ph: 0.4 },
  { len: 290, a: 6, sp: -38, ph: 2.1 },
  { len: 150, a: 2.5, sp: 95, ph: 4.0 },
]
function swellH(x: number, t: number, c: Ctx, lag = 0) {
  let y = 0
  for (const w of swellWaves) y -= w.a * amp(c) * Math.cos((TAU / w.len) * (x - w.sp * (t - lag)) + w.ph)
  return y
}
export const swell: Style = {
  H: (x, t, c) => swellH(x, t, c),
  mark(m, t, c, o) {
    const lag = m.d / 260 // swells reach deeper rows a little later
    const h = -swellH(m.x, t, c, lag) / (21.5 * amp(c)) // -1 trough .. 1 crest
    const dec = Math.exp(-m.d / 110)
    const crest = 0.5 + 0.5 * h
    o.dy = -h * 10 * amp(c) * dec
    o.s = 0.34 + 0.42 * crest * (0.45 + 0.55 * dec)
    o.a = (0.2 + 0.7 * crest) * fadeDepth(m, c)
    o.hi = smooth(0.62, 1, crest) * dec * 0.9
  },
}

// 2. Pond: rings spread through the field from where the boat lands and from its wake.
type Drop = { x: number; t0: number; a: number }
function pondStyle(): Style {
  const drops: Drop[] = []
  let nextAmbient = 0, nextWake = 0
  const K = TAU / 46, SP = 120
  // Rings around a point on the water line; y is depth below it
  const ringAt = (x: number, y: number, t: number) => {
    let v = 0
    for (const d of drops) {
      const age = t - d.t0
      if (age < 0) continue
      const dist = Math.hypot(x - d.x, y)
      const r = age * SP - dist
      if (r < -50) continue
      v += d.a * Math.exp(-age / 3.4) * (Math.exp(-((r / 20) ** 2)) + 0.55 * Math.exp(-(((r - 58) / 20) ** 2)) + 0.25 * Math.exp(-(((r - 116) / 20) ** 2)) - 0.18 * Math.exp(-(((r - 29) / 14) ** 2))) / (1 + dist / 520)
    }
    return v
  }
  return {
    frame(t, c) {
      for (let i = drops.length - 1; i >= 0; i--) if (t - drops[i].t0 > 7) drops.splice(i, 1)
      if (t > nextAmbient) { drops.push({ x: c.w * (0.1 + Math.random() * 0.8), t0: t, a: 0.7 }); nextAmbient = t + 0.9 + Math.random() * 1.1 }
      if (c.boatX != null && t > nextWake) { drops.push({ x: c.boatX, t0: t, a: 0.55 }); nextWake = t + 1.1 }
    },
    onLand(x, t) { drops.push({ x, t0: t, a: 1.7 }); drops.push({ x, t0: t + 0.35, a: 0.9 }); nextWake = t + 1.2 },
    H: (x, t, c) => -2 * amp(c) * Math.cos(x / 120 - t * 1.3) - 2.5 * amp(c) * Math.max(-1, Math.min(1, ringAt(x, 0, t))),
    mark(m, t, c, o) {
      const e = Math.max(-1, Math.min(1, ringAt(m.x, m.d, t)))
      o.dy = -e * 6 * amp(c)
      const idle = 0.5 + 0.5 * Math.sin(m.x * 0.021 + m.d * 0.05 - t * 1.6) * Math.sin(m.x * 0.009 - m.d * 0.03 + t * 0.9)
      o.s = 0.36 + 0.06 * idle + 0.5 * smooth(0, 0.9, e)
      o.a = (0.27 + 0.12 * idle + 0.6 * smooth(0, 0.9, e)) * fadeDepth(m, c)
      o.hi = smooth(0.45, 1, e) * 0.85
    },
  }
}
export const pond = pondStyle

// 3. Interference: three sources whose rings cross; marks grow where crests meet.
function interferenceStyle(): Style {
  const K = TAU / 74, W = TAU / 2.4
  // Two sources just above the water line: their rings arc down through the short band,
  // so the crossing arcs read as rings rather than stripes.
  const src = (t: number, c: Ctx) => [
    { x: c.w * (0.28 + 0.07 * Math.sin(t * 0.13)), y: -36, a: 1 },
    { x: c.w * (0.72 + 0.06 * Math.cos(t * 0.11)), y: -36, a: 1 },
  ]
  let S: { x: number; y: number; a: number }[] = []
  const F = (x: number, y: number) => {
    let v = 0
    for (const s of S) {
      const r = Math.hypot(x - s.x, y - s.y)
      v += s.a * Math.cos(r * K - tNow * W) / (1 + r / 520)
    }
    return v / 1.5
  }
  let tNow = 0
  const sync = (t: number, c: Ctx) => { if (t !== tNow || !S.length) { tNow = t; S = src(t, c) } }
  return {
    frame: sync,
    H: (x, t, c) => { sync(t, c); return -5 * amp(c) * F(x, 0) },
    mark(m, t, c, o) {
      sync(t, c)
      const v = F(m.x, m.d)
      o.dy = -v * 4 * amp(c)
      o.s = 0.14 + 0.72 * smooth(-0.8, 0.95, v)
      o.a = (0.05 + 0.92 * smooth(-0.6, 0.95, v)) * fadeDepth(m, c)
      o.hi = smooth(0.55, 1.05, v) * 0.9
    },
  }
}
export const interference = interferenceStyle

// 4. Tide: a long leaning wave; each row below follows a beat later and a step behind,
// so the rows read as successive tide lines sliding up the beach.
const tideH = (x: number, t: number, c: Ctx) => {
  const th = (TAU / 520) * x - t * 1.25
  // steepened (Stokes) shape leans the crests forward
  const v = Math.cos(th) + 0.38 * Math.cos(2 * th - 0.6) + 0.12 * Math.cos(3 * th - 1.1)
  return amp(c) * (-11 * v + 5 * Math.sin(t * 0.55) - 3 * Math.cos(x / 170 + t * 2.1))
}
export const tide: Style = {
  H: tideH,
  mark(m, t, c, o) {
    const lagT = m.j * 0.32
    const v = -tideH(m.x - m.j * 24, t - lagT, c) / (17 * amp(c))
    const dec = Math.exp(-m.j / 5)
    o.dy = -v * 9 * amp(c) * dec
    const band = 0.5 + 0.5 * v
    o.s = 0.3 + 0.44 * band * (0.5 + 0.5 * dec)
    o.a = (0.14 + 0.75 * band) * fadeDepth(m, c)
    o.hi = smooth(0.75, 1.05, band) * 0.6 * dec
  },
}

// 5. Depth: a perspective field of marks to a horizon, bobbing like buoys at sea.
function depthStyle(): Style {
  // world: X across, Z distance. Screen: y = hy + F / Z
  let hy = 0, F = 0, ZB = 1, zs: number[] = []
  const swellW = (X: number, Z: number, t: number) =>
    Math.cos(X * 0.012 + Z * 0.02 - t * 1.4) * 0.65 + Math.cos(X * 0.027 - Z * 0.011 - t * 1.05 + 1.7) * 0.35
  const BOB = 26 // world px of bob at Z = ZB
  const toX = (x: number, Z: number, c: Ctx) => ((x - c.w / 2) * Z) / ZB
  return {
    frontRides: false,
    layout(c) {
      hy = Math.max(10, c.waterY - Math.min(56, (c.h - c.waterY) * 0.4 + 20))
      ZB = 1
      F = c.waterY - hy // a mark at Z = 1 lands on the water line
      const cells: Cell[] = []
      const base = c.cell
      // rows: geometric steps in Z so on-screen spacing tracks the mark size
      zs = []
      for (let z = 1; z < 9; z *= 1 + 0.9 * base / F) zs.push(z)
      for (let z = 1 / (1 + 0.9 * base / F); hy + F / z < c.h + base; z /= 1 + 0.9 * base / F) zs.unshift(z)
      for (const Z of zs) {
        const y = hy + F / Z, sc = 1 / Z, gap = base * 1.25
        const span = (c.w / 2) * Z + gap
        for (let X = -Math.ceil(span / gap) * gap; X <= span; X += gap) {
          const x = c.w / 2 + X / Z
          if (x < -base * 2 || x > c.w + base * 2) continue
          cells.push({ i: 0, j: Z === 1 ? 0 : 1, x, y: y - base * sc * 0.5, d: 0, cell: base * sc, z: Z, X })
        }
      }
      return cells
    },
    H: (x, t, c) => -BOB * amp(c) * swellW(toX(x, 1, c), 1, t) * 0.6,
    // Z = 1 row uses the full live surface (c.S) so the boat rides exactly what is drawn
    mark(m, t, c, o) {
      const Z = m.z!, v = swellW(m.X!, Z, t)
      // The Z = 1 row sits its top edge exactly on the sampled line
      o.dy = (-BOB * amp(c) * v * 0.6) / Math.max(1, Z) // near rows bob no more than the boat row
      if (Math.abs(Z - 1) < 1e-6) { o.abs = true; o.dy = c.S(m.x, t) }
      const far = smooth(1, 8, Z)
      o.s = 0.7 + 0.12 * v
      o.a = 0.75 * (1 - smooth(1, 6, Z) * 0.92) * (0.65 + 0.35 * (0.5 + 0.5 * v)) * (Z < 1 ? 1 - 0.6 * smooth(1, 0.45, Z) : 1)
      o.hi = smooth(0.55, 1, v) * (1 - far) * 0.6
      if (Math.abs(Z - 1) < 1e-6) o.dy += (m.cell * o.s) / 2 // top edge on the line
    },
  }
}
export const depth = depthStyle
