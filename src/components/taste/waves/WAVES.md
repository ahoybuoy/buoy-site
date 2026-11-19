# Wave styles (the hero sea)

A wave style is an Astro component at `src/components/taste/waves/<Name>.astro`, registered in `registry.ts`. `<BoatHero sea="<id>">` renders it in the sea layer instead of the live `WaveBackground`. With no `sea` prop (or `sea="current"`), BoatHero renders the live sea, so the homepage stays as it is.

- Preview one: `/taste/waves/<id>` (a copy of the homepage hero with that sea). Compare them all: `/taste/waves` (Desktop/Phone toggle, Replay).
- Shots: `node <scratchpad>/tools/wave-shot.mjs <id>` (see the end of this file).
- Reference: `OceanSwell.astro` (canvas, Realistic).

## Registry

```ts
import MyStyle from './MyStyle.astro'
// in waveStyles:
'my-style': { name: 'My style', group: 'Digital', component: MyStyle, note: 'One or two sentences for the viewer.' },
```

`group` is one of `Realistic`, `Digital`, `Logomark`, `Experimental` (`Live` is only for `current`). The id is the URL slug.

## Contract

1. **Root.** The root element has the class `.wave-background` and fills the sea: `position: absolute; inset: 0; overflow: hidden; z-index: 0`. The boat's container, the splash and the drag physics look it up by that class. Put every layer inside it. Never put `transform`, `filter`, `contain` or `will-change` on the root (the boat's landing maths use the sea box). A mask on the root is fine; the homepage adds a top fade on desktop and a top+bottom fade on phones.
2. **Water line element.** Provide a `.wave-container-1` element whose vertical middle is the water line (it can be an invisible, zero-height div). Put it at roughly 55-62% of the sea's height. It is the fallback for landing when there is no sampler. Optionally add `.wave-container-3` at the same line: the drag physics read 5/8 of its height as a fallback (only without a sampler).
3. **Surface sampler (required for new styles).** Set `rootEl.buoySurface = (x, aheadMs = 0) => ({ y, slope })` in your script.
   - `x` is in px from the left edge of `.wave-background`. `y` is the water surface in px from its top, for the frame being drawn now (plus `aheadMs` into the future, used once to aim the drop). `slope` is dy/dx at x (positive means the water goes down to the right).
   - BoatHero then makes the drifting boat ride the water. Each frame, the hull sits `--boat-hero-draft` px (default 3) below `y` under the boat's centre, and the boat tilts to `atan(slope)`, clamped to ±14° and smoothed with a damped spring. The CSS bob is held at rest while it follows. The drop lands on the sampled surface, and drag/toss lands back on it. There is no pop at the hand-off: any gap left is eased out over about 120ms.
   - **It must match what is drawn.** Use the same time value your renderer uses for that frame. For rAF styles, use `document.timeline.currentTime`, which equals the rAF timestamp of the current frame. Use the same layer (the front one, which the boat appears to sit on) and the same scale.
   - **Canvas:** sample your height function directly. If points move sideways (Gerstner/trochoid), invert x with a few fixed-point steps: `x0 += x - X(x0)`. See `OceanSwell.astro`.
   - **SVG scrolled by CSS:** use `svgPathSurface(root, '.your-wave-container')` from `./surface.ts`. It reads the path's top edge into a lookup table once and adds the container's live `translateX`. The path must start along the crest from x=0 to the right edge of the viewBox and then close along the bottom. The live sea uses it on `.wave-container-3` (the frontmost wave).
   - **SVG animated by JS:** keep your height function in JS and sample that.
   - **WebGL:** mirror the shader's height function in JS: the same constants and the same `uTime`, set from the same timestamp.
   - **No literal water line** (abstract styles): return the line you want the boat to ride, such as a gentle sine. Without a sampler the old fixed bob is used.
   - `slope` can be a central difference: `(y(x+2) - y(x-2)) / 4`.
4. **Size and layout.** It must look right at full width with the boat drifting left to right across it (25s a lap) and at 390px wide. Under 768px the sea is a 240px band placed between the hero copy and the PR card (`[data-boat-sea-slot]`), so it needs to read well at that height too. Read the size from the root (ResizeObserver) and never set sizes that change layout. Add nothing outside the root.
5. **Motion.** Use requestAnimationFrame or CSS only, and make it feel alive, not sleepy, but not cartoonish.
   - Pause when off screen (IntersectionObserver on the root) and when `document.hidden` (visibilitychange). Resume without a time jump.
   - Under `prefers-reduced-motion: reduce`, draw one static, good-looking frame. The boat does not follow then; it shows statically as on live.
   - Keep it cheap. Canvas or WebGL is fine. Cap DPR at 2. Use no libraries beyond `package.json`. Aim for 60fps at 1440x900 beside the page (the shot tool reports FPS; headless uses a software renderer, so 45+ there is fine).
6. **Colour.** Take colours from CSS custom properties so they follow the ground: `--color-bg`, `--color-buoy`, `--color-ink`, and so on. Define your palette as custom properties on the root (`color-mix()` with the ground is good). Canvas/WebGL styles resolve them through a hidden probe element (`probe.style.color = value; getComputedStyle(probe).color`). See `resolver()` in `OceanSwell.astro`. The BoatHero tint variables (`--boat-hero-wave-1/2/3`, `--boat-hero-sky`) only apply to `current`.
7. **The logo mark** is never redrawn, recoloured or varied. Use `BuoyMark.astro` or the mark geometry as whole marks (see `MarkPattern.astro` + `src/scripts/markPatterns.js`).
8. **The splash** (`createSplash`) is drawn by BoatHero into the root. Styles do not need to change it.

## Parameters (wave action)

The viewer's sliders and presets (Calm, Breezy, Rough, Storm) set four CSS custom properties on the framed page's `<html>`. A page can also set them on the hero, and `/taste/waves/<id>?intensity=1.4&speed=1.2` sets them too.

| Property | Range | Default | Meaning |
|---|---|---|---|
| `--wave-intensity` | 0–2 | 1 | amplitude |
| `--wave-speed` | 0.25–2.5 | 1 | time scale |
| `--wave-chop` | 0–1 | the style's own | shorter, steeper waves with more harmonics |
| `--wave-variation` | 0–1 | the style's own (~0.3) | sets: slow travelling amplitude groups, a period of several seconds |

Every style uses one mechanism, `params.ts`. Every style must support all four, or say in its registry note which ones are no-ops.

- **Clock.** Call `const clock = createWaveClock(root, { chop, variation }, startT)` once.
  - Then call `clock.at(now)` with the rAF timestamp in the renderer, and with `document.timeline.currentTime` in the sampler. It is idempotent per timestamp, so both get the same `{ t, p }`.
  - `t` advances by `dt × speed`, so changing the speed never jumps the phase.
  - `p` eases toward new values in about 300ms (the properties are read every 150ms), so slider moves never pop.
  - `clock.setRunning(fn)` freezes `t` while off screen or under reduced motion. `clock.ahead(ms)` gives the look-ahead time.
- **Envelope.** `waveEnvelope(x, t, variation)` is the deterministic amplitude multiplier for the sets. Multiply amplitude by `p.intensity × waveEnvelope(x0, t, p.variation)` in both the renderer and the sampler.
- **SVG styles scrolled by CSS** can call `driveSvgSea(root)` from `surface.ts`. It maps speed to the animations' playbackRate and intensity × variation to path amplitude. It returns an amplitude getter for `svgPathSurface`. `current` uses it, and chop is a no-op there.
- **The sampler must use the same `t` and `p`,** or the boat leaves the water when the sliders move.

## Splash and wake (drawn by BoatHero)

- **Splash.** Two wavelets travel out along the sampled surface with a dimple and a rebound. Droplets fall back onto the sampled water and leave tiny ripples.
- **Wake.** A bow lip, two trailing lines fanning out behind the boat, and stern foam, all drawn on the sampled surface.
- **Colour.** Set `--boat-hero-splash` and/or `--boat-hero-wake` on your root. The default is a pale sea blue.
- **Custom splash (optional).** Expose `root.buoySplash = (x, y, info) => {}` to draw your own splash instead of the default.
  - `x` and `y` are in px within the root, at the hull on the water.
  - `info` is `{ kind: 'drop' | 'toss', strength }`. `strength` is 1 for now.
  - Keep it on the water: sample `buoySurface`. Keep it short (under about 1s). Draw nothing under reduced motion (BoatHero does not call it then).
- **Submerged boat.** While the boat is held, or released, with its hull below the sampled surface, BoatHero turns the wake off. It draws a displacement ripple above the boat and bubbles that rise and pop at the surface, and it dims the boat with depth.
  - **Custom version (optional):** set `root.buoySubmerged = (x, depth, { hullY, surfaceY }) => {}`. BoatHero calls it every frame while the boat is under, with `x` and `hullY` in root px and `depth` in px below the water. BoatHero then skips its own ripple and bubbles; the dimming stays.
  - **Release under water:** the boat bobs up with a small overshoot and a splash, then resumes riding. The drag physics asks `window._buoySurfaceAt(x)`, which BoatHero provides from your sampler.
- **Off** under reduced motion.

## The boat

The boat is the SVG `taste/boat/options/boat-52-editorial.svg` (64×64, hull bottom centre at 32,54).
- The wave boat is 44px (`--boat-hero-boat-size`; 38px under 768px).
- It follows, tilts and lands at its hull point. Tilt is a stiff damped spring led by a 35ms look-ahead (`buoySurface(x, 35)`), clamped to ±14°.
- Implement `aheadMs` in your sampler, or the tilt and the drop aim lag slightly.

## Depth knobs

- `--boat-hero-draft` (px, default 3): how deep the hull sits below the sampled surface. Set it on your root to tune.
- `--boat-hero-sink`: legacy, only used without a sampler. It is read on your root, so you can override it there. The homepage sets it to 70px on desktop because the live landing measured from `.wave-container-1`.

## Shot tool

`node /private/tmp/claude-501/-Users-dylantarre--claude-spares-spare-VAQvvy/c24d9a96-1b34-4951-a119-2d480fda5a0d/scratchpad/tools/wave-shot.mjs <id> [path]`

- Writes `shots/waves/<id>-desk.png`, `-mob.png` and `-mob430.png`. Each has frames at 0.5, 1.4, 2.0, 3.0 and 7s (header + hero).
- Logs console errors, overflow, the boat's rect at 7s, any overlap with text, buttons or the card, FPS, and a follow trace: the hull-to-surface gap at hand-off and its maximum, the per-frame pop, and the tilt lag.
- `crest.mjs <id>` writes a 2x crop of the crest band at 1440.
- `frames.mjs <name> <path> [startS] [stepMs] [count] [w] [h] [water|boat|drop]` writes 2x crops at a fixed step of page time. It uses the slow-motion clock in `slowmo.js`; set `RATE=1` for real time.
- `splash.mjs <id>` writes frames every 60ms around the impact.
- `drop-trace.mjs <path> [w] [h]` measures the hull point and angle every frame through the escape and reports the jumps at each boundary.
- Other builders' edits reload the dev server (HMR). The tool flags this; rerun when it does.
