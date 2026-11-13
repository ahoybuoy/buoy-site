// Buoy mark patterns, drawn on a canvas.
// The same generators as the brand kit (brand/generative-kit.html): grids of whole Buoy marks whose
// size or position moves in waves. Marks at the peak of the motion take the logo red.
// Colours come from the site tokens (--color-navy-light, --color-mark), so both themes work.
// Timings match the site: the wave bobs on a 4s period, slower drifts run on 12s and 25s.

const TAU = Math.PI * 2
const sn = (a) => 0.5 + 0.5 * Math.sin(a)
const UNIT = 600 // px per pattern unit, so features keep the same physical size on any canvas

// One corner piece of the mark in its 40-unit box; four turns of it make the mark.
const PIECE = 'M22.8 2H26A12 12 0 0 1 38 14V17.2H29V17A6 6 0 0 0 23 11H22.8Z'
let MARK = null
function markPath() {
  if (!MARK) {
    MARK = new Path2D()
    const piece = new Path2D(PIECE)
    for (let k = 0; k < 4; k++) MARK.addPath(piece, new DOMMatrix().translate(20, 20).rotate(k * 90).translate(-20, -20))
  }
  return MARK
}

function rng(str) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19) }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296 }
}

// A grid model: marks never leave their cell. mk(R, W, H, cols) returns f(x, y, t, i) giving size 0..1,
// with x and y in pattern units. `red` scales how much of the peak takes the brand colour.
function grid(mk, red = 0.12) {
  return (w, h, { R, drift, cell }) => {
    const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell)
    const ox = (w - cols * cell) / 2, oy = (h - rows * cell) / 2, u = cell / UNIT
    const cut = 1 - drift * red, f = mk(R, w / UNIT, h / UNIT, cols)
    return {
      n: rows * cols,
      at(k, t) {
        const i = k % cols, j = (k - i) / cols, v = f((i + 0.5) * u, (j + 0.5) * u, t, i)
        return [ox + (i + 0.5) * cell, oy + (j + 0.5) * cell, cell * (0.2 + 0.74 * v), 0, v > cut]
      },
    }
  }
}

const MODELS = {
  // Rows of marks riding a wave. A few marks, chosen by the seed, are red.
  swell(w, h, { R, drift, cell }) {
    const cols = Math.ceil(w / cell) + 1, rows = Math.ceil(h / cell) + 1, s = cell * 0.62
    const amp = cell * (0.15 + drift * 0.45), f = TAU / (380 + R() * 320), ph = R() * TAU, lag = 0.5 + R(), items = []
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) items.push({ x: i * cell, y: j * cell, a: i * cell * f + ph + j * lag, d: R() < drift * 0.1 })
    return {
      n: items.length,
      at(k, t) {
        const m = items[k], a = m.a - (t * TAU) / 4
        return [m.x, m.y + Math.sin(a) * amp, s, Math.cos(a) * 28 * (0.3 + drift), m.d]
      },
    }
  },
  field: grid((R) => {
    const a = 3 + R() * 5, c = 3 + R() * 5, p1 = R() * TAU, p2 = R() * TAU, p3 = R() * TAU
    return (x, y, t) => 0.5 + 0.5 * (0.6 * Math.sin(x * a + p1 + (t * TAU) / 12) * Math.cos(y * c + p2 - (t * TAU) / 25) + 0.4 * Math.sin((x + y) * (a + c) * 0.5 + p3 - (t * TAU) / 12))
  }, 0.35),
  pulse: grid((R, W, H) => {
    const cx = W * (0.2 + R() * 0.6), cy = H * (0.2 + R() * 0.6), k = 14 + R() * 8
    return (x, y, t) => sn(Math.hypot(x - cx, y - cy) * k - (t * TAU) / 4)
  }),
  tide: grid((R) => {
    const k = 8 + R() * 6, tilt = (R() - 0.5) * 3
    return (x, y, t) => sn(y * k + x * tilt - (t * TAU) / 6)
  }),
  // One line sweeping left to right, the way a scan reads a page.
  scan: grid((R, W) => (x, y, t) => {
    const pos = (((t / 6) % 1) * 1.4 - 0.2) * W
    return 0.22 + 0.78 * Math.exp(-(((x - pos) / 0.12) ** 2))
  }, 0.35),
  // Chevrons that point up and travel up.
  wake: grid((R, W) => {
    const cx = W * (0.3 + R() * 0.4), k = 9 + R() * 6
    return (x, y, t) => sn(Math.abs(x - cx) * k * 1.4 - y * k - (t * TAU) / 6)
  }),
  // Each column carries one pulse downward at its own speed.
  rain: grid((R, W, H, cols) => {
    const sp = [], ph = []
    for (let i = 0; i < cols; i++) { sp.push(0.5 + R()); ph.push(R()) }
    return (x, y, t, i) => {
      const u = (((y / H - (t / 8) * sp[i] + ph[i]) % 1) + 1) % 1
      return 0.2 + 0.8 * Math.exp(-(((u - 0.5) / 0.12) ** 2))
    }
  }, 0.35),
}

function mount(canvas) {
  if (canvas.dataset.mounted) return
  canvas.dataset.mounted = 'true'
  const ctx = canvas.getContext('2d')
  const make = MODELS[canvas.dataset.markPattern] || MODELS.swell
  const cell = Number(canvas.dataset.cell) || 28
  const drift = Number(canvas.dataset.drift ?? 0.3)
  const seed = canvas.dataset.seed || 'buoy'
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  let model = null, dpr = 1, quiet = '', signal = '', visible = false, raf = 0, clock = 0, last = 0

  function readTokens() {
    const cs = getComputedStyle(canvas)
    quiet = cs.getPropertyValue('--color-navy-light').trim()
    signal = cs.getPropertyValue('--color-mark').trim()
  }
  function resize() {
    const r = canvas.getBoundingClientRect()
    if (!r.width || !r.height) return
    dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(r.width * dpr)
    canvas.height = Math.round(r.height * dpr)
    model = make(r.width, r.height, { R: rng(seed), drift, cell })
    draw()
  }
  function draw() {
    if (!model) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const path = markPath(), marks = []
    for (let k = 0; k < model.n; k++) marks.push(model.at(k, clock))
    for (const red of [false, true]) {
      ctx.fillStyle = red ? signal : quiet
      for (const [x, y, s, rot, d] of marks) {
        if (d !== red) continue
        ctx.setTransform(dpr, 0, 0, dpr, x * dpr, y * dpr)
        if (rot) ctx.rotate((rot * Math.PI) / 180)
        ctx.scale(s / 40, s / 40)
        ctx.translate(-20, -20)
        ctx.fill(path)
      }
    }
  }
  function tick(now) {
    raf = 0
    if (!visible || reduce.matches) return
    clock += Math.min(0.1, (now - last) / 1000)
    last = now
    draw()
    raf = requestAnimationFrame(tick)
  }
  function start() {
    if (raf || !visible || reduce.matches) return
    last = performance.now()
    raf = requestAnimationFrame(tick)
  }

  readTokens()
  resize()
  new ResizeObserver(resize).observe(canvas)
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; start() }).observe(canvas)
  new MutationObserver(() => { readTokens(); draw() }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  reduce.addEventListener('change', start)
}

export function mountAll() {
  document.querySelectorAll('canvas[data-mark-pattern]').forEach(mount)
}
