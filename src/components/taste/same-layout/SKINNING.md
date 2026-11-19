# Skinning the same-layout homepage

`HomeBase.astro` renders the whole homepage inside `<div class="sl sl-<skin>">`. A skin is one stylesheet scoped to `.sl-<skin>` plus a page that renders `<HomeBase skin="<skin>" />`. The markup, copy and layout are shared by every skin; only the look changes.

```astro
---
import HomeBase from '../../../components/taste/same-layout/HomeBase.astro'
import '../../../components/taste/same-layout/skins/paper.css'
---
<HomeBase skin="paper">
  <link slot="head" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600&display=swap" />
</HomeBase>
```

The unnamed slot renders at the end of the root (after the footer) for optional extras.

## What is off-limits (LAYOUT)

The first half of `base.css`, under the `LAYOUT` banner. Do not override: `display`, grid and flex properties, column counts, breakpoints (640 / 768 / 1024px), `order`, alignment and `text-align`, `position` and offsets, container max-widths (80rem page, 64 / 56 / 48 / 42rem blocks), the margins that space elements inside a block, or anything that changes which elements show at which width. Do not hide or reorder sections or content.

## What is free (DEFAULT SKIN)

The second half of `base.css`: colour, type, borders, radii, shadows, backgrounds, padding inside components, opacity, transforms, transitions, pseudo-elements, the decor layers and the icon slots. Start with the variables; write rules against the hooks only where a variable does not reach.

Specificity: base rules are `.sl .sl-thing` (0,2,0). Write skin rules as `.sl-<skin> .sl-thing` (same weight) and import the skin after `HomeBase`, or use `.sl.sl-<skin> .sl-thing` to be safe. Variables go on `.sl.sl-<skin>`.

## Variables (declared on `.sl`)

| Variable | Meaning |
| --- | --- |
| `--sl-bg` | Page ground and default section ground |
| `--sl-bg-alt` | Alternate section ground (`.sl-section--alt`), terminal title bar |
| `--sl-surface` | Card fill on the default ground |
| `--sl-surface-2` | Card fill on the alternate ground (journey, plan cards, PDF preview) |
| `--sl-border` | Default hairline for cards, header, footer |
| `--sl-text` | Headings and primary text |
| `--sl-text-muted` | Body copy, leads, nav links |
| `--sl-text-faint` | Tertiary text: list items, footnotes |
| `--sl-accent` | Brand accent (default `var(--color-buoy)`): primary button, links, highlight |
| `--sl-accent-hover` | Primary button hover fill |
| `--sl-accent-contrast` | Text on the accent |
| `--sl-accent-2` | Second accent (default lavender): "Design system" tag, plus lists, hosted card |
| `--sl-success` / `--sl-warning` / `--sl-critical` / `--sl-info` | Status colours for badges, code pair, terminal, lists |
| `--sl-code-bg` / `--sl-code-text` | Terminal, install command, step commands, code tokens |
| `--sl-font-display` / `--sl-font-body` / `--sl-font-mono` | Heading, body and code families |
| `--sl-h1-size` / `--sl-h2-size` / `--sl-h3-size` | Hero title, section titles, card and step titles |
| `--sl-body-size` / `--sl-lead-size` / `--sl-small-size` | Base text, section leads, small text |
| `--sl-heading-weight` / `--sl-heading-tracking` / `--sl-heading-leading` | Heading weight, letter-spacing, line-height |
| `--sl-leading` | Body line-height |
| `--sl-radius-sm` / `--sl-radius-md` / `--sl-radius-lg` | Inline code chips, boxes, cards |
| `--sl-btn-radius` / `--sl-btn-height` | Button and input corner radius; large button and input height (default is height minus 0.5rem, small minus 0.75rem) |
| `--sl-shadow-sm` / `--sl-shadow-md` / `--sl-shadow-lg` | Elevation steps (PR card uses md, terminal and PDF preview use lg) |
| `--sl-section-pad` | Vertical section padding (lead capture uses two thirds of it) |
| `--sl-gap` | Grid gap (drift grid uses half, journey three quarters) |
| `--sl-ease` / `--sl-duration` | Transition curve and time |
| `--sl-pr-bg`, `-bg-2`, `-border`, `-text`, `-muted`, `-link`, `-open`, `-error`, `-warn`, `-fix` | The GitHub-style PR card's own palette |

`--sl-section-pad` and `--sl-gap` are consumed by layout rules, so changing them is the supported way to change rhythm.

## Class hooks by section

- **Root / shared:** `sl`, `sl-<skin>`, `sl-container` (`--md`), `sl-section` (`--alt`), `sl-section__head` (`--lg`), `sl-section__title`, `sl-section__lead`, `sl-grid` (`--2`, `--3`, `--4`), `sl-more` (`--lg`), `sl-link` (`--strong`), `sl-btn` (`--primary`, `--secondary`, `--sm`, `--lg`), `sl-pill` (`--accent`, `--success`), `sl-pill__text`, `sl-pill__icon`, `sl-badge` (`--warning`, `--critical`, `--info`), `sl-tag` (`--success`, `--accent`, `--accent-2`), `sl-dot` (`--critical`, `--warning`, `--success`), `sl-list` (`--check`, `--plus`, `--lg`), `sl-list__item`, `sl-inline-code`, `sl-decor` (`--waves`, `--pattern`)
- **Header:** `sl-header`, `sl-header__inner`, `sl-header__logo`, `sl-logo`, `sl-header__nav`, `sl-header__link`, `sl-header__actions`
- **Callout:** `sl-callout`, `sl-callout__link`, `sl-callout__pill`, `sl-callout__text`, `sl-callout__arrow`
- **Hero:** `sl-hero`, `sl-hero__content`, `sl-hero__inner`, `sl-hero__badge`, `sl-hero__title`, `sl-hero__word`, `sl-hero__highlight`, `sl-hero__sub`, `sl-hero__boat`, `sl-hero__boat-glyph`, `sl-hero__ctas`, `sl-hero__scan`, `sl-hero__install`, `sl-hero__install-prompt`, `sl-hero__install-cmd`, `sl-hero__scroll`
- **Problem:** `sl-problem`, `sl-problem__pair`, `sl-code` (`--bad`, `--good`), `sl-code__bar`, `sl-code__label`, `sl-code__file`, `sl-code__body`, `sl-code__pre`, `sl-tok` (`--bad`, `--good`, `--dim`), `sl-catch`, `sl-catch__title`, `sl-catch__demo`, `sl-catch__box`, `sl-catch__label`, `sl-catch__list`, `sl-catch__item`, `sl-catch__mark`, `sl-catch__name`, `sl-catch__detail`
- **Lead capture:** `sl-lead`, `sl-lead__grid`, `sl-lead__copy`, `sl-lead__tag`, `sl-lead__title`, `sl-lead__sub`, `sl-lead__note`, `sl-form`, `sl-input`, `sl-form__msg` (`--success`, `--error`), `sl-lead__preview`, `sl-doc`, `sl-doc__bar`, `sl-doc__name`, `sl-doc__list`, `sl-doc__item` (`--more`), `sl-doc__box`
- **Terminal demo:** `sl-demo`, `sl-demo__content`, `sl-terminal`, `sl-terminal__bar`, `sl-terminal__dots`, `sl-terminal__name`, `sl-terminal__body`, `sl-terminal__cmd`, `sl-terminal__prompt`, `sl-terminal__input`, `sl-terminal__out`, `sl-terminal__line` (`--critical`, `--warning`, `--faint`), `sl-terminal__gap`, `sl-t` (`--accent`, `--warning`, `--critical`, `--muted`, `--faint`, `--strong`)
- **PR check:** `sl-check`, `sl-pr`, `sl-pr__head`, `sl-pr__title`, `sl-pr__icon` (`--open`, `--fail`), `sl-pr__name`, `sl-pr__num`, `sl-pr__status`, `sl-pr__status-text`, `sl-pr__rows`, `sl-pr__row`, `sl-pr__level` (`--error`, `--warn`), `sl-pr__detail`, `sl-pr__loc`, `sl-pr__file`, `sl-pr__line`, `sl-pr__msg`, `sl-pr__fix`, `sl-pr__code` (`--error`, `--warn`, `--fix`), `sl-pr__foot`, `sl-pr__foot-note`, `sl-pr__by`, `sl-pr__by-label`, `sl-pr__by-name`, `sl-check__cta`, `sl-check__actions`
- **Drift grid:** `sl-features`, `sl-features__grid`, `sl-card sl-card--drift` plus `sl-card--warning` / `--critical` / `--info`, `sl-card__top`, `sl-card__icon`, `sl-card__title`, `sl-card__link`, `sl-card__text`
- **Steps:** `sl-steps`, `sl-steps__grid`, `sl-step`, `sl-step__num`, `sl-step__title`, `sl-step__cmd`, `sl-step__text`
- **Integrations:** `sl-integrations`, `sl-integrations__row`, `sl-chip`, `sl-chip__icon`, `sl-chip__name`
- **Journey:** `sl-journey`, `sl-journey__wrap`, `sl-journey__grid`, `sl-card sl-card--journey` plus `sl-card--free` / `--app` / `--org`, `sl-card__body`, `sl-journey__path`, `sl-journey__stage` (`--free`, `--app`, `--org`)
- **AI is optional:** `sl-ai`, `sl-ai__pill`, `sl-ai__pair`, `sl-card sl-card--plan` plus `sl-card--core` / `--hosted`, `sl-card__head`, `sl-card__heading`, `sl-card__kicker`, `sl-card__foot`, `sl-ai__note`
- **Footer:** `sl-footer`, `sl-footer__inner`, `sl-footer__brand`, `sl-footer__mark`, `sl-footer__copy`, `sl-footer__links`, `sl-footer__link`, `sl-footer__sep`

## Decor layers

- `.sl-decor--waves` (hero): the live `WaveBackground` and `WaveBoat`. It fills the hero behind the content. Hide it with `display: none` and paint `.sl-hero` yourself. When it is hidden the boat script does nothing and removes the small boat at the end of the hero sentence (`.sl-hero__boat`); hide that span in CSS too so it never flashes.
- `.sl-decor--pattern` (terminal section): the live `MarkPattern` canvas at 70% opacity. Hide with `display: none`, or change `opacity`. The marks are drawn in the brand orange by the canvas script and do not follow `--sl-accent`.
- `.sl-lead::before` and `.sl-demo::before` are gradient overlays in the default skin; set `background: none` to drop them.
- `LockOn` (the animated editor in "Buoy plugs the holes") is the live component with its own scoped styles and colours. Leave it alone; you may frame it through `.sl-catch__demo`.

## Icon slots

Where the live page had an icon, the base leaves `<span class="sl-card__icon" aria-hidden="true" data-icon="name">`, hidden by default (`display: none`). To use them, set `display: block` (or `inline-block`) and draw with a background, mask or pseudo-element keyed on `data-icon`. Names: drift cards `palette`, `package`, `tag`, `alert`, `wrench`, `accessibility`, `globe`, `ghost`; integrations `react`, `vue`, `svelte`, `angular`, `nextjs`, `tailwind`, `github`; journey `search`, `traffic-light`, `chart`; AI section `lock`, `sparkles`. No emoji. Showing them is the one `display` change a skin may make.

List markers (`.sl-list--check` and `--plus` items) and the "what Buoy catches" dot (`.sl-catch__mark`) are drawn in CSS, so a skin can restyle or replace them.

## Example skin

```css
/* skins/paper.css */
.sl.sl-paper {
  --sl-bg: #f6f3ec;
  --sl-bg-alt: #ece7dc;
  --sl-surface: #fffdf8;
  --sl-surface-2: #fffdf8;
  --sl-border: #d9d2c3;
  --sl-text: #1c1a17;
  --sl-text-muted: #55504a;
  --sl-text-faint: #7b756d;
  --sl-accent-contrast: #fff;
  --sl-font-display: 'Fraunces', serif;
  --sl-radius-lg: 2px;
  --sl-btn-radius: 2px;
}
.sl.sl-paper .sl-decor--waves, .sl.sl-paper .sl-hero__boat { display: none; }
.sl.sl-paper .sl-btn--primary { box-shadow: none; }
```
