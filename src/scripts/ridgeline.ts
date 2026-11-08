/**
 * Ridgeline viewer: draws a page's ridgeline (one line per 24px band, height
 * = how much is happening across it) with the page's components marked, and
 * wires hover-to-slice. Data comes from api.buoy.design/public/ridgeline.
 */
export interface RidgelineComponent { k: string; x: number; y: number; w: number; h: number; t: string; s: string }
export interface Packed { data: string; bands: number; bins: number }
export interface RidgelineData extends Packed {
  url: string; host: string; title: string; W: number; H: number; band: number; bin: number;
  els: RidgelineComponent[]; preview: string; looks: number; rare: number; thumb: Packed; renderedAt: string;
}

export const API = 'https://api.buoy.design'

export const COLORS = { bg: '#050506', fg: '#f1efe8', muted: '#8c9099', button: '#43b0f1', rare: '#ff6b57', input: '#2fbf8f', heading: '#e8b04a', badge: '#c99cff' }

export function unpack(p: Packed): number[][] {
  const bin = atob(p.data)
  const rows: number[][] = []
  for (let i = 0; i < p.bands; i++) {
    const row = new Array(p.bins)
    for (let j = 0; j < p.bins; j++) row[j] = bin.charCodeAt(i * p.bins + j)
    rows.push(row)
  }
  return rows
}

interface Prepared {
  rows: number[][]
  ridges: number[]
  step: number
  rare: Set<string>
  cols: number[]
}

export function prepare(d: Pick<RidgelineData, 'bands' | 'bins' | 'data' | 'els'>, target = 96): Prepared {
  const rows = unpack(d)
  const step = Math.max(1, Math.round(rows.length / target))
  const ridges: number[] = []
  for (let i = 0; i < rows.length; i += step) ridges.push(i)
  const counts = new Map<string, number>()
  for (const e of d.els) if (e.k === 'button') counts.set(e.s, (counts.get(e.s) ?? 0) + 1)
  const rare = new Set([...counts].filter(([, n]) => n === 1).map(([s]) => s))
  // Columns: x positions where peaks line up down the page.
  const nb = rows[0]?.length ?? 0
  const hist = new Array(nb).fill(0)
  for (const r of rows) for (let x = 2; x < nb - 2; x++) {
    const v = r[x]
    if (v > 90 && v >= r[x - 1] && v >= r[x + 1] && v >= r[x - 2] && v >= r[x + 2]) hist[x]++
  }
  const sm = hist.map((v, i) => (hist[i - 1] ?? 0) + v + (hist[i + 1] ?? 0))
  const top = Math.max(1, ...sm)
  const cols: number[] = []
  sm.map((v, i) => [v, i] as const).sort((a, b) => b[0] - a[0]).forEach(([v, i]) => {
    if (v >= top * 0.6 && !cols.some((c) => Math.abs(c - i) < 14)) cols.push(i)
  })
  return { rows, ridges, step, rare, cols }
}

export interface DrawOptions { components?: boolean; columns?: boolean; hover?: number; label?: boolean }

/** Draw onto a canvas; returns the geometry hover needs. */
export function draw(cv: HTMLCanvasElement, d: RidgelineData | (Pick<RidgelineData, 'host' | 'H' | 'band' | 'bin' | 'els'> & Packed), p: Prepared, o: DrawOptions = {}) {
  const c = cv.getContext('2d')!
  const W = cv.width
  const H = cv.height
  c.fillStyle = COLORS.bg
  c.fillRect(0, 0, W, H)
  const mx = W * 0.08
  const top = H * (o.label === false ? 0.08 : 0.1)
  const usable = H * 0.84
  const gap = usable / p.ridges.length
  const amp = gap * 7.5
  const nb = p.rows[0]?.length ?? 1
  const X = (i: number) => mx + (i / Math.max(1, nb - 1)) * (W - 2 * mx)
  const hover = o.hover ?? -1
  if (o.columns) for (const b of p.cols) {
    c.strokeStyle = 'rgba(67,176,241,.3)'
    c.setLineDash([3, 6])
    c.lineWidth = 1
    c.beginPath()
    c.moveTo(X(b), top - amp)
    c.lineTo(X(b), top + usable)
    c.stroke()
    c.setLineDash([])
  }
  const thin = W > 600 ? 1.25 : 0.9
  p.ridges.forEach((ri, k) => {
    const base = top + k * gap
    const row = p.rows[ri]!
    const y = (i: number) => {
      const v = Math.min(1, row[i]! / 255)
      const edge = Math.min(1, Math.sin(Math.PI * Math.min(1, Math.max(0, (i / (nb - 1)) * 1.04 - 0.02))) ** 0.35)
      return base - v * amp * (0.35 + 0.65 * edge)
    }
    c.beginPath()
    c.moveTo(X(0), base)
    for (let i = 0; i < nb; i++) c.lineTo(X(i), y(i))
    c.lineTo(X(nb - 1), base)
    c.closePath()
    c.fillStyle = COLORS.bg
    c.fill()
    c.beginPath()
    for (let i = 0; i < nb; i++) (i ? c.lineTo(X(i), y(i)) : c.moveTo(X(i), y(i)))
    c.strokeStyle = hover === k ? COLORS.rare : COLORS.fg
    c.lineWidth = hover === k ? 2.2 : thin
    c.globalAlpha = hover >= 0 && hover !== k ? 0.55 : 1
    c.stroke()
    c.globalAlpha = 1
    if (o.components !== false) {
      const y0 = ri * d.band
      const y1 = y0 + d.band * p.step
      for (const e of d.els) {
        const cy = e.y + e.h / 2
        if (cy < y0 || cy >= y1) continue
        const kind = e.k === 'button' && p.rare.has(e.s) ? 'rare' : e.k
        const a = Math.max(0, Math.floor(e.x / d.bin))
        const b = Math.min(nb - 1, Math.ceil((e.x + e.w) / d.bin))
        c.beginPath()
        for (let i = a; i <= b; i++) (i === a ? c.moveTo(X(i), y(i)) : c.lineTo(X(i), y(i)))
        c.strokeStyle = (COLORS as Record<string, string>)[kind] ?? COLORS.fg
        c.lineWidth = W > 600 ? 3 : 2
        c.stroke()
      }
    }
  })
  if (o.label !== false) {
    c.fillStyle = COLORS.muted
    c.font = `500 ${Math.round(W * 0.022)}px "IBM Plex Mono", ui-monospace, monospace`
    c.textAlign = 'left'
    c.fillText(d.host.toUpperCase(), mx, H * 0.045)
    c.textAlign = 'right'
    c.fillText(`${Math.round(d.H)}px · ${p.rows.length} bands`, W - mx, H * 0.045)
  }
  return { top, gap }
}

/** A gallery thumbnail from the small packed version. */
export function drawThumb(cv: HTMLCanvasElement, host: string, thumb: Packed) {
  const p = prepare({ ...thumb, els: [] }, 40)
  draw(cv, { host, H: 0, band: 96, bin: 24, els: [], ...thumb }, p, { components: false, label: false })
}

/** Mount the full interactive viewer on a root holding [data-ridge-canvas] etc. */
export function mount(root: HTMLElement, d: RidgelineData) {
  const cv = root.querySelector<HTMLCanvasElement>('[data-ridge-canvas]')!
  const info = root.querySelector<HTMLElement>('[data-ridge-info]')!
  const slice = root.querySelector<HTMLElement>('[data-ridge-slice]')!
  const p = prepare(d)
  const state = { components: true, columns: false, hover: -1 }
  let geom = { top: 0, gap: 1 }
  const render = () => { geom = draw(cv, d, p, state) }
  const show = (k: number) => {
    if (k < 0) {
      info.textContent = 'Hover or tap a ridge to see that slice of the real page.'
      slice.style.backgroundImage = ''
      return
    }
    const ri = p.ridges[k]!
    const y0 = ri * d.band
    const y1 = y0 + d.band * p.step
    const inside = d.els.filter((e) => { const cy = e.y + e.h / 2; return cy >= y0 && cy < y1 })
    const scale = 720 / d.W
    const f = slice.clientWidth / 720
    slice.style.backgroundImage = `url(${d.preview})`
    slice.style.backgroundSize = `${slice.clientWidth}px ${d.H * scale * f}px`
    slice.style.backgroundPosition = `0 ${-(y0 * scale * f) + slice.clientHeight / 2 - (d.band * p.step * scale * f) / 2}px`
    info.replaceChildren()
    const head = document.createElement('strong')
    head.textContent = `${y0}–${y1}px down the page`
    info.append(head)
    if (inside.length === 0) info.append(document.createElement('br'), 'No controls here: layout and text only.')
    for (const e of inside.slice(0, 4)) {
      info.append(document.createElement('br'))
      const line = document.createElement('span')
      line.textContent = `${e.k}${e.t ? ` “${e.t}”` : ''}`
      if (e.k === 'button' && p.rare.has(e.s)) {
        const tag = document.createElement('span')
        tag.style.color = COLORS.rare
        tag.textContent = ' · look used once'
        line.append(tag)
      }
      info.append(line)
    }
  }
  const locate = (ev: PointerEvent) => {
    const r = cv.getBoundingClientRect()
    const y = (ev.clientY - r.top) * (cv.height / r.height)
    if (y < geom.top - geom.gap * 4) return -1
    return Math.max(0, Math.min(p.ridges.length - 1, Math.round((y - geom.top) / geom.gap)))
  }
  cv.addEventListener('pointermove', (ev) => {
    const k = locate(ev)
    if (k !== state.hover) { state.hover = k; render(); show(k) }
  })
  cv.addEventListener('pointerleave', () => { state.hover = -1; render(); show(-1) })
  root.querySelectorAll<HTMLButtonElement>('[data-ridge-toggle]').forEach((b) => {
    b.addEventListener('click', () => {
      const key = b.dataset.ridgeToggle as 'components' | 'columns'
      state[key] = !state[key]
      b.setAttribute('aria-pressed', String(state[key]))
      render()
    })
  })
  const stats = root.querySelector<HTMLElement>('[data-ridge-stats]')
  if (stats) {
    const items: Array<[number, string]> = [[d.looks, 'button looks'], [d.rare, 'used once'], [p.cols.length, 'strong columns'], [d.els.filter((e) => e.k === 'heading').length, 'headings']]
    stats.replaceChildren(...items.map(([v, l]) => {
      const box = document.createElement('div')
      box.className = 'ridge-stat'
      const n = document.createElement('div')
      n.className = 'ridge-stat-v'
      n.textContent = String(v)
      const t = document.createElement('div')
      t.className = 'ridge-stat-l'
      t.textContent = l
      box.append(n, t)
      return box
    }))
  }
  render()
  show(-1)
  document.fonts?.ready.then(render)
}
