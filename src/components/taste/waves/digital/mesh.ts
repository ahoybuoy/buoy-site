import { field, type Frame } from './sea'
// Shared perspective mesh for mesh-sea and mesh-grid. Rows sit at multiples of the cell in world z,
// so z = 0 is always a real grid row: the front surface the boat rides.
export const ZS = 260          // world depth per unit of perspective divisor
const CELL = 34         // world grid cell (px at the datum row)
const DMAX = 9.5   // fog is fully clear of the line tone by d = 9
const horizon = (f: Frame) => f.waterY * (f.mobile ? 0.5 : 0.6)

export function drawMesh(f: Frame, highlights: boolean) {
  const { ctx, w, h, waterY, t, scale } = f
  const hz = horizon(f)
  const cx = w / 2
  const cell = CELL * (f.mobile ? 0.7 : 1)
  const span = waterY - hz
  const Y = (d: number) => hz + span / d
  const dNear = Math.max(0.42, span / (h + 40 - hz))
  // Fog: line alpha by depth, piecewise linear through these stops. Lines are bucketed into
  // NB alpha bands, one solid stroke per band (much cheaper than one gradient-stroked path).
  const FOG: [number, number][] = [[dNear, 0.2], [1, 0.55], [1.3, 0.45], [2.6, 0.24], [5, 0.07], [9, 0]]
  const fog = (d: number) => {
    if (d <= FOG[0][0]) return FOG[0][1]
    for (let i = 1; i < FOG.length; i++) if (d <= FOG[i][0]) {
      const [d0, a0] = FOG[i - 1], [d1, a1] = FOG[i]
      return a0 + (a1 - a0) * (d - d0) / (d1 - d0)
    }
    return 0
  }
  const NB = 10, AMAX = 0.55
  const bands: Path2D[] = Array.from({ length: NB }, () => new Path2D())
  const band = (d: number) => Math.min(NB - 1, Math.round((fog(d) / AMAX) * (NB - 1)))

  const STEP = f.mobile ? 6 : 8
  const dCol = Math.min(DMAX, cell / 6)
  const colX0 = cx - Math.floor(((w / 2 + STEP) * dCol) / cell) * cell
  const nCols = Math.floor((2 * (cx - colX0)) / cell) + 1
  let prev: Float32Array | null = null, prevD = 0
  // Rows (constant world z, multiples of the cell); column vertices cached per row
  for (let zw = Math.ceil((dNear - 1) * ZS / cell) * cell; zw < (DMAX - 1) * ZS; zw += cell) {
    const d = 1 + zw / ZS
    if (d < dNear) continue
    const bi = band(d)
    const base = Y(d)
    if (bi > 0) {
      const path = bands[bi]
      const st = STEP * Math.min(3, Math.max(1, Math.round(d / 2.5)))
      for (let sx = -STEP; sx <= w + st; sx += st) {
        const y = base + field(cx + (sx - cx) * d, zw, t, scale) / d
        sx === -STEP ? path.moveTo(sx, y) : path.lineTo(sx, y)
      }
    }
    // Columns (constant world x): straight segments between consecutive rows, while d < dCol
    if (d <= dCol + cell / ZS) {
      const cur = new Float32Array(nCols * 2)
      for (let j = 0; j < nCols; j++) {
        const xw = colX0 + j * cell
        const sx = cx + (xw - cx) / d
        cur[j * 2] = sx
        cur[j * 2 + 1] = sx < -40 || sx > w + 40 ? NaN : base + field(xw, zw, t, scale) / d
      }
      if (prev) {
        const cb = band((d + prevD) / 2)
        if (cb > 0) {
          const path = bands[cb]
          for (let j = 0; j < nCols; j++) {
            const y0 = prev[j * 2 + 1], y1 = cur[j * 2 + 1]
            if (y0 !== y0 || y1 !== y1) continue
            path.moveTo(prev[j * 2], y0); path.lineTo(cur[j * 2], y1)
          }
        }
      }
      prev = cur; prevD = d
    }
  }
  ctx.strokeStyle = f.c.line
  ctx.lineWidth = 0.75
  ctx.lineJoin = 'round'
  for (let i = 1; i < NB; i++) {
    ctx.globalAlpha = (i / (NB - 1)) * AMAX
    ctx.stroke(bands[i])
  }
  ctx.globalAlpha = 1

  if (!highlights) return
  // Highlighted rows: the datum (z = 0, the surface) and two grid rows further back
  ctx.strokeStyle = f.c.datum
  ctx.lineWidth = 1.1
  for (const [n, a] of [[0, 0.75], [4, 0.42], [11, 0.22]] as const) {
    const zw = n * cell, d = 1 + zw / ZS, base = Y(d)
    ctx.beginPath()
    for (let sx = -STEP; sx <= w + STEP; sx += n ? STEP : 3) {
      const y = base + field(cx + (sx - cx) * d, zw, t, scale) / d
      sx === -STEP ? ctx.moveTo(sx, y) : ctx.lineTo(sx, y)
    }
    ctx.globalAlpha = a
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}


/** Mesh halftone: the same vertices as drawMesh, printed as dots (crests bigger, far smaller) */
export function drawMeshDots(f: Frame) {
  const { ctx, w, h, waterY, t, scale } = f
  const hz = horizon(f)
  const cx = w / 2
  const cell = CELL * (f.mobile ? 0.62 : 0.8)
  const span = waterY - hz
  const Y = (d: number) => hz + span / d
  const dNear = Math.max(0.42, span / (h + 40 - hz))
  const amp = 24 * scale
  const R = cell * 0.24
  ctx.fillStyle = f.c.ink
  for (let zw = Math.ceil((dNear - 1) * ZS / cell) * cell; zw < 6 * ZS; zw += cell) {
    const d = 1 + zw / ZS
    const fog = d < 1 ? 0.2 + 0.5 * d * d : Math.max(0, 0.7 * Math.pow(1 / d, 1.1) - 0.05)
    if (fog <= 0.02) break
    const base = Y(d)
    ctx.globalAlpha = fog
    ctx.beginPath()
    const reach = (w / 2 + R * 2) * d
    for (let xw = cx - Math.floor(reach / cell) * cell; xw <= cx + reach; xw += cell) {
      const fy = field(xw, zw, t, scale)
      const n = Math.max(0, Math.min(1, 0.5 - fy / amp))
      const r = (R / Math.pow(d, 0.85)) * (0.3 + 0.7 * n)
      if (r < 0.45) continue
      const sx = cx + (xw - cx) / d, y = base + fy / d
      ctx.moveTo(sx + r, y); ctx.arc(sx, y, r, 0, Math.PI * 2)
    }
    ctx.fill()
  }
  ctx.globalAlpha = 1
}
