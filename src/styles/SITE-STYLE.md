# Buoy site style

The homepage (`src/pages/index.astro`, from `/taste/dark/feel-better`) is the reference. Tokens are in `global.css`. Classes are in `site.css` (all `ui-*`, in `@layer components`, so Tailwind utilities on the same element still win). Dark is the design target. `html.light` re-points the same tokens, so if you use tokens, light mode looks after itself.

## Palette

| Token | Use |
|---|---|
| `--color-bg` | Page ground. Brand navy, never black. |
| `--color-band` | Alternate section ground (`ui-section--band`). |
| `--color-surface` / `--color-raised` | Cards, panels, secondary buttons / hover and header rows inside panels. |
| `--color-sunken` | Trays, code chips, hover wash. |
| `--color-term` | Terminal and code ground. |
| `--color-ink` / `--color-body` / `--color-muted` | Headings and strong text / running text / captions, meta, table heads. |
| `--color-line` / `--color-line-strong` | Hairline rules / the top rule of a table or column set. |
| `--color-buoy` (#FF4F00), `--color-buoy-light` | Primary actions, step numbers, GitHub App tier word, link underlines. Never a full section ground. |
| `--color-ok` | Tokens, fixes, the free/open-source tier. |
| `--color-crit` | Struck old values, critical severity. |
| `--color-warn`, `--color-info` | Warning and info severity words. |
| `--color-lavender-light` | The organization tier only. |
| `--color-add-bg/ink`, `--color-del-bg/ink` | Diff lines. |

Shadows: `--ring` (the faint white ring used instead of a border), `--ring-hover`, `--ring-lift` (ring plus depth, for floating panels), `--ring-term`. Radii: `--radius-btn` 10, `--radius-inner` 14, `--radius-card` 16, `--radius-tray` 20 (= inner + 6px tray padding), `--radius-cta` 24. Type: `--font-display` Hanken Grotesk (all headings; h1 and h2 at 800, the rest at 700), `--font-body` Inter, `--font-mono` JetBrains Mono; `--text-h1`, `--text-h2`, `--text-h3`, `--text-lede`. Easing: `--ease-swap` for icon swaps, `--ease-out-expo`.

Old names (`--color-navy*`, `--color-light`, `--color-slate*`, `--color-success/warning/critical/info`, `--color-sunrise`) still work and now hold the new values. Prefer the new names in new code.

Colour lives in the content: struck red old values, green tokens, coloured severity words, coloured tier names, terminal colours, orange buttons, and the moving MarkPattern backgrounds. Keep pages lively with those.

## Rejected (do not use)

- Pill or tag badges ("Free PDF" chips and the like). Use a coloured word (`ui-eyebrow`, `ui-tier-name`).
- 3px coloured edges on rows or cards.
- Decorative square or dot markers, icon tiles, decorative emoji.
- Tinted cards with coloured rings and same-colour glows (`glow-buoy` and `glow-lavender` now do nothing).
- Gradient corner washes, blurred colour blobs.
- Hover lifts or scale on things that are not links or buttons.
- Hairlines that fade to a colour peak.
- Em dashes in copy. Buttons in a group that differ in size. Layout that shifts after load.

## Classes

Layout
- `ui-wrap`: 1120px column with 24px gutters (16px on phones). `<div class="ui-wrap">`
- `ui-section`: section with 104px padding and a top rule. Modifiers: `--band` (lifted ground), `--last` (more room before the footer), `--first` (no rule), `--patterned` (holds a MarkPattern). `<section class="ui-section ui-section--band">`
- `ui-nav-offset`: top padding for the fixed Nav. Put it on `<main>`.
- `ui-head`: h2 plus lede, 640px wide. `--center` centres it. An `h1` inside gets a larger size. `<div class="ui-head"><h2>…</h2><p>…</p></div>`
- `ui-eyebrow`: small orange line above a heading. `<p class="ui-eyebrow">Free PDF</p>`
- `ui-lede`: hero paragraph. `ui-after`: closing line under a block. `ui-note`: small muted note.
- `ui-actions`: button row, full-width buttons on phones. `<div class="ui-actions"><a class="ui-btn ui-btn--primary">…</a></div>`
- `ui-split`: copy and figure columns, stacks at 960px.

Surfaces
- `ui-card`: surface with ring edge, 16px radius. `--pad` 28px padding, `--lift` adds depth. `<article class="ui-card ui-card--pad">`
- `ui-tray` > `ui-panel`: sunken holder around a product surface, with concentric radii. `ui-panel-head` is the file or title row. `<div class="ui-tray"><div class="ui-panel"><div class="ui-panel-head">file.tsx</div>…</div></div>`
- `ui-figure` + `figcaption`: figure with a muted caption.

Code
- `ui-term`: terminal frame. Children are `ui-term-bar` and `pre` (or `ui-term-body`). Colours: `ui-t-dim`, `ui-t-hi`, `ui-t-ok`, `ui-t-warn`, `ui-t-crit`, `ui-t-info`, `ui-t-prompt`. `<div class="ui-term"><div class="ui-term-bar">Terminal</div><pre><span class="ui-t-dim">$</span> buoy drift check</pre></div>`
- `ui-code`: inline command chip. `<code class="ui-code">npx ahoybuoy dock</code>`
- `ui-icon-btn`: small square icon button, used for copy buttons.

Tables and rules
- `ui-table`: ruled table with an uppercase muted head. `del` inside goes struck red, `ins` goes green. `--hover` adds a row hover wash. `--stack` turns a 3-column table into two lines per row on phones. Add `ui-end` to the cells of a right-aligned last column. `<table class="ui-table ui-table--stack">`
- `ui-ruled`: list with hairlines between items. `--top` adds a top rule, `--tight` uses top rules and tighter rows (the tier lists). `<ul class="ui-ruled"><li>…</li></ul>`
- `ui-steps`: numbered steps with orange tabular numbers. `<ol class="ui-steps"><li><span class="ui-step-n">1</span><div><h3>…</h3><p>…</p></div></li></ol>`
- `ui-cols` > `ui-col`: columns split by rules under a strong top rule (the plans look). `--3` gives three columns. Inside a column: `ui-col-sub` and `ui-col-foot`. `<div class="ui-cols"><article class="ui-col"><h3>Core</h3><p class="ui-col-sub ui-c-ok">Open-source CLI</p></article>…</div>`

Buttons and links
- `ui-btn` plus `--primary` (orange), `--secondary` (ring), `--ghost`. Sizes are `--sm` (40px), default (44px) and `--lg` (48px). `--icon` trims the icon side, `--block` makes it full width. Press scale is built in. `<a class="ui-btn ui-btn--primary">Install the GitHub App</a>`
- `ui-chip`: small ring-edged link (integrations). It is not a pill.
- `ui-link`: inline link, ink with an orange offset underline. `ui-rowlink`: quieter underline for links in tables and lists.

Text roles
- `ui-old`: struck red old value. `ui-token`: green token. `<span class="ui-old">#fff</span> <span class="ui-token">var(--bg)</span>`
- `ui-sev` plus `ui-sev-critical`, `ui-sev-warning` or `ui-sev-info`: severity words.
- `ui-tier-name` plus `ui-tier-free` (green), `ui-tier-app` (orange) or `ui-tier-org` (lavender).
- `ui-c-ok`, `ui-c-buoy`, `ui-c-lavender`, `ui-c-warn`, `ui-c-crit`, `ui-c-info`: plain colour words.

Forms
- `ui-scan`: one-line field with an inset button. `<form class="ui-scan"><input …/><button class="ui-btn ui-btn--primary">Scan</button></form>`
- `ui-cta`: scan-box card, with copy on the left and the form on the right.
- `ui-msg` plus `--ok` or `--err`: form result line.

Long-form
- `ui-prose`: docs, guides and legal text. It styles headings (h2 gets a top rule), lists, tables, code, `pre`, blockquotes, links, `hr` and images. `<article class="ui-prose">…</article>`

Utilities: `ui-mono`, `ui-tnum` (tabular numbers), `ui-sr` (screen-reader only), `ui-skip` (skip link), `ui-enter` (one-time entrance; set `animation-delay` inline).

Base styles already applied: Hanken Grotesk headings with `text-wrap: balance`; `pretty` wrapping on p, li, figcaption, dd and blockquote; mono code; an orange focus-visible ring; `cursor: pointer` on buttons; underline offset on all links. Smooth scrolling is turned off under reduced motion.

## Shared components

- `Nav` (`layout?: 'contained' | 'full'`): fixed 65px header. It has the logo, the Features, Use Cases and Compare menus, Scan a repo, Reports, Docs, Pricing, GitHub, the theme toggle, the Install button and the mobile menu. Pages need `ui-nav-offset` (or their own 65px top space) under it.
- `Footer`: no props.
- `Button` (`href?`, `variant: primary|secondary|ghost`, `size: sm|md|lg`, `external?`, `type?`, `class?`): renders the `ui-btn` classes.
- `Terminal` (`command?`, `lines[{text,type,delay}]`, `autoplay?`, `class?`): typed terminal with a reserved 300px height.
- `DocTerminal` (`command`, `lines?`, `class?`): static command terminal with a copy button.
- `CodeBlock` (`code`, `language?`, `filename?`, `highlights?`, `showLineNumbers?`, `class?`): highlighted lines get the green add wash.
- `FeatureCard` (`title`, `description`, `href?`, `examples?`; `icon` is ignored): ring-edged card.
- `LeadMagnetForm` (`leadMagnet`, `buttonText?`, `successMessage?`, `class?`): `ui-scan` email field.
- `LeadMagnetCTA` (section with a `ui-cta` card), `LeadMagnetCallout` (inline `ui-card`), `LeadCaptureSection` (`forceVariant?`, A/B test kept).
- Leave these alone: `BuoyLogo`, `BuoyMark`, `MarkPattern`, `WaveBackground`, `WaveBoat`, `LockOn`, and `components/taste/*`.

## MarkPattern backgrounds

```astro
<section class="ui-section ui-section--patterned">
  <MarkPattern pattern="swell" drift={0.3} fade class="ui-pattern" />
  <div class="ui-wrap">…</div>
</section>
```

`ui-section--patterned` sets `position: relative; overflow: hidden; isolation: isolate`. `ui-pattern` sets `z-index: -1; opacity: 0.32`. Patterns include `swell`, `field` and `tide`. Use about one patterned section in three, and vary the pattern.
