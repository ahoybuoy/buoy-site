/**
 * System map viewer: tokens → primitives → composites → pages as four lanes
 * of dots. Click a dot to light up what it feeds (downstream) and what it is
 * built from (upstream). Data is the packed `buoy show map` output stored with
 * each public scan report.
 */
export type PackedNode = [kind: number, name: string, path: string, value: string, category: string, drift: number, examples: string[]]
export interface PackedMap {
  version: 1
  stats: {
    components: number; pages: number; primitives: number; icons: number; tokens: number
    tokensUnused: number; componentsUnused: number; driftInComponents: number
  }
  nodes: PackedNode[]
  edges: Array<[number, number, 0 | 1]>
}

export const KIND = ['Token', 'Icon', 'Primitive', 'Composite', 'Page']
const LANE = [0, 1, 1, 2, 3]

export function tokenColor(v: string): string | null {
  if (!v) return null
  if (/^#([0-9a-f]{3,8})$/i.test(v) || (/^(rgb|hsl)a?\(/i.test(v) && !/var\(/.test(v))) return v
  const m = /^(-?[\d.]+)(deg)?\s+([\d.]+)%\s+([\d.]+)%/.exec(v)
  return m ? `hsl(${m[1]} ${m[3]}% ${m[4]}%)` : null
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

export function mountSystemMap(root: HTMLElement, data: PackedMap): void {
  const cv = root.querySelector<HTMLCanvasElement>('[data-map-canvas]')!
  const info = root.querySelector<HTMLElement>('[data-map-info]')!
  const tip = root.querySelector<HTMLElement>('[data-map-tip]')!
  const search = root.querySelector<HTMLInputElement>('[data-map-search]')!
  const names = root.querySelector<HTMLDataListElement>('datalist')!
  const css = (v: string) => getComputedStyle(root).getPropertyValue(v).trim()

  const n = data.nodes.length
  const flow: number[][] = Array.from({ length: n }, () => [])
  const back: number[][] = Array.from({ length: n }, () => [])
  // Impact flows token → component that uses it, and child → parent that renders it.
  for (const [s, t, type] of data.edges) {
    if (type === 0) { flow[s]!.push(t); back[t]!.push(s) } else { flow[t]!.push(s); back[s]!.push(t) }
  }
  const reach = (start: number, adj: number[][]) => {
    const seen = new Set([start]); const q = [start]
    while (q.length) { const x = q.pop()!; for (const y of adj[x]!) if (!seen.has(y)) { seen.add(y); q.push(y) } }
    seen.delete(start); return seen
  }
  const pagesReached = data.nodes.map((_, i) => { let c = 0; for (const j of reach(i, flow)) if (data.nodes[j]![0] === 4) c++; return c })

  let sel = -1, hover = -1, dpr = 1
  let pos: Array<{ x: number; y: number; r: number }> = []
  data.nodes.forEach((nd, i) => { if (nd[0] >= 2 && nd[0] <= 3 && (sel < 0 || pagesReached[i]! > pagesReached[sel]!)) sel = i })

  names.replaceChildren(...data.nodes.map((nd) => Object.assign(document.createElement('option'), { value: nd[1] })))

  function layout() {
    const W = cv.clientWidth || cv.parentElement!.clientWidth
    dpr = window.devicePixelRatio || 1
    const laneW = W / 4, pad = 12
    const lanes: number[][] = [[], [], [], []]
    data.nodes.forEach((nd, i) => lanes[LANE[nd[0]]!]!.push(i))
    const isIcon = (i: number) => (data.nodes[i]![0] === 1 ? 1 : 0)
    for (const l of lanes) l.sort((a, b) => isIcon(a) - isIcon(b) || pagesReached[b]! - pagesReached[a]! || data.nodes[a]![1].localeCompare(data.nodes[b]![1]))
    pos = new Array(n)
    let H = 0
    lanes.forEach((l, li) => {
      // Fill roughly a 560px-tall board: fewer items get bigger cells.
      const cell = Math.max(8, Math.min(26, Math.floor(Math.sqrt(((laneW - pad * 2) * 560) / Math.max(1, l.length)))))
      const cols = Math.max(1, Math.floor((laneW - pad * 2) / cell))
      let row = 0, col = 0, lastIcon = false
      for (const i of l) {
        const icon = isIcon(i) === 1
        if (icon && !lastIcon && (col || row)) { row += col ? 2 : 1; col = 0 }
        lastIcon = icon
        pos[i] = {
          x: li * laneW + pad + col * cell + cell / 2,
          y: pad + row * cell + cell / 2,
          r: Math.max(cell * 0.16, Math.min(cell * 0.46, (icon ? 1.4 : 2.2) + Math.sqrt(pagesReached[i]!) * 0.9)),
        }
        if (++col >= cols) { col = 0; row++ }
      }
      H = Math.max(H, pad + (row + 1) * cell + pad)
    })
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = `${H}px`
  }

  function draw() {
    const g = cv.getContext('2d')!
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    const W = cv.width / dpr, H = cv.height / dpr
    g.clearRect(0, 0, W, H)
    g.strokeStyle = css('--map-line'); g.lineWidth = 1
    for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * W / 4 + 0.5, 0); g.lineTo(i * W / 4 + 0.5, H); g.stroke() }
    const down = sel >= 0 ? reach(sel, flow) : new Set<number>()
    const up = sel >= 0 ? reach(sel, back) : new Set<number>()
    const lit = (i: number) => sel < 0 || i === sel || down.has(i) || up.has(i)
    const accent = css('--map-down'), blue = css('--map-up')
    if (sel >= 0) {
      const edge = (a: number, b: number) => { const p = pos[a]!, q = pos[b]!; const mx = (p.x + q.x) / 2; g.beginPath(); g.moveTo(p.x, p.y); g.bezierCurveTo(mx, p.y, mx, q.y, q.x, q.y); g.stroke() }
      g.lineWidth = 1
      g.strokeStyle = accent; g.globalAlpha = down.size > 300 ? 0.18 : 0.4
      for (const a of [sel, ...down]) for (const b of flow[a]!) if (down.has(b)) edge(a, b)
      g.strokeStyle = blue; g.globalAlpha = up.size > 300 ? 0.18 : 0.4
      for (const a of [sel, ...up]) for (const b of back[a]!) if (up.has(b)) edge(a, b)
      g.globalAlpha = 1
    }
    const dot = css('--map-dot'), dim = css('--map-dim'), drift = css('--map-drift'), ink = css('--map-ink'), muted = css('--map-muted')
    data.nodes.forEach((nd, i) => {
      const p = pos[i]!; const on = lit(i)
      const swatch = nd[0] === 0 ? tokenColor(nd[3]) : null
      g.globalAlpha = on ? 1 : 0.35
      g.fillStyle = swatch || (!on ? dim : sel >= 0 && i !== sel ? (down.has(i) ? accent : blue) : dot)
      g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill()
      if (swatch) { g.strokeStyle = on ? muted : dim; g.lineWidth = 0.6; g.stroke() }
      if (nd[5] > 0) { g.strokeStyle = drift; g.lineWidth = 1.4; g.beginPath(); g.arc(p.x, p.y, p.r + 1.8, 0, 7); g.stroke() }
    })
    g.globalAlpha = 1
    for (const i of [sel, hover]) if (i >= 0) { const p = pos[i]!; g.strokeStyle = ink; g.lineWidth = 2; g.beginPath(); g.arc(p.x, p.y, p.r + 3.5, 0, 7); g.stroke() }
  }

  function list(ids: Iterable<number>, label: string) {
    const arr = [...ids].sort((a, b) => pagesReached[b]! - pagesReached[a]! || data.nodes[a]![0] - data.nodes[b]![0])
    if (!arr.length) return ''
    const rows = arr.slice(0, 80).map((i) => {
      const nd = data.nodes[i]!; const c = nd[0] === 0 ? tokenColor(nd[3]) : null
      return `<button type="button" data-i="${i}"><span>${c ? `<i class="sw" style="background:${esc(c)}"></i>` : ''}${esc(nd[1])}</span><span>${KIND[nd[0]]!.toLowerCase()}</span></button>`
    }).join('')
    return `<div><h3>${label} · ${arr.length}</h3><div class="map-list">${rows}</div>${arr.length > 80 ? `<p class="note">and ${arr.length - 80} more</p>` : ''}</div>`
  }

  function renderInfo() {
    if (sel < 0) { info.innerHTML = '<p class="note">Click a dot to see its connections.</p>'; return }
    const nd = data.nodes[sel]!
    const down = reach(sel, flow), up = reach(sel, back)
    const parents = flow[sel]!.filter((j) => data.nodes[j]![0] !== 0)
    const pages = [...down].filter((j) => data.nodes[j]![0] === 4)
    const tokens = [...up].filter((j) => data.nodes[j]![0] === 0)
    const c = nd[0] === 0 ? tokenColor(nd[3]) : null
    info.innerHTML = `
      <div><div class="kind">${KIND[nd[0]]}</div><div class="name">${c ? `<i class="sw" style="background:${esc(c)}"></i>` : ''}${esc(nd[1])}</div><div class="path">${esc(nd[2])}${nd[3] ? ' · ' + esc(nd[3]) : ''}</div></div>
      <div class="big">
        <div class="dn"><b>${pages.length}</b>pages reached</div>
        <div class="dn"><b>${down.size - pages.length}</b>components affected</div>
        <div class="upc"><b>${nd[0] === 0 ? 0 : tokens.length}</b>tokens used</div>
        ${nd[5] ? `<div class="dr"><b>${nd[5]}</b>drift</div>` : ''}
      </div>
      ${nd[5] ? `<div class="drift">${nd[6].map((m) => `<div>${esc(m)}</div>`).join('')}</div>` : ''}
      ${nd[0] === 0 && down.size === 0 ? '<p class="note">No scanned component uses this token through a class or var().</p>' : ''}
      ${nd[0] !== 0 && nd[0] !== 4 && parents.length === 0 ? '<p class="note">No other scanned component renders this one.</p>' : ''}
      ${list(nd[0] === 0 ? flow[sel]! : parents, nd[0] === 0 ? 'Used directly by' : 'Rendered by')}
      ${list(back[sel]!.filter((j) => data.nodes[j]![0] !== 0), 'Renders')}
      ${nd[0] !== 0 ? list(back[sel]!.filter((j) => data.nodes[j]![0] === 0), 'Tokens used directly') : ''}
      ${list(pages, 'Pages reached')}`
    info.querySelectorAll<HTMLButtonElement>('button[data-i]').forEach((b) => b.addEventListener('click', () => select(Number(b.dataset.i))))
  }

  function select(i: number) { sel = i; draw(); renderInfo() }

  function hit(e: MouseEvent) {
    const r = cv.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top
    let best = -1, bd = Infinity
    pos.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd && d < Math.max(36, (p.r + 3) ** 2)) { bd = d; best = i } })
    return best
  }
  cv.addEventListener('mousemove', (e) => {
    const i = hit(e)
    if (i !== hover) { hover = i; draw() }
    if (i < 0) { tip.hidden = true; return }
    const nd = data.nodes[i]!
    tip.textContent = `${nd[1]} · ${KIND[nd[0]]!.toLowerCase()} · ${pagesReached[i]} pages`
    tip.hidden = false
    tip.style.left = `${Math.min(e.clientX + 12, innerWidth - tip.offsetWidth - 8)}px`
    tip.style.top = `${e.clientY + 14}px`
  })
  cv.addEventListener('mouseleave', () => { hover = -1; tip.hidden = true; draw() })
  cv.addEventListener('click', (e) => { const i = hit(e); if (i >= 0) select(i) })
  search.addEventListener('change', () => {
    const v = search.value.trim().toLowerCase(); if (!v) return
    const exact = data.nodes.findIndex((nd) => nd[1].toLowerCase() === v)
    const j = exact >= 0 ? exact : data.nodes.findIndex((nd) => nd[1].toLowerCase().includes(v))
    if (j >= 0) select(j)
  })
  let t: ReturnType<typeof setTimeout> | undefined
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { layout(); draw() }, 120) })

  layout(); draw(); renderInfo()
}
