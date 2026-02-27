# Design System Showcase Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a `/design-system` page at `src/pages/design-system.astro` that is a single-scroll, Storybook-inspired showcase of every token and component in the Subsequent Saturn Design System — zero hardcoded values, zero drift.

**Architecture:** A single Astro page using the existing `Layout.astro` + `Nav.astro` shell. All tokens come from CSS variables defined in `src/styles/global.css`. All components used are live instances from `src/components/`. A sticky anchor bar lets users jump to each section. The page itself is a living test target for `buoy check`.

**Tech Stack:** Astro 5, Tailwind 4 (CSS-variable tokens via `@theme`), existing components (Button, FeatureCard, Terminal, CodeBlock), no new dependencies.

---

### Task 1: Create the page shell

**Files:**
- Create: `src/pages/design-system.astro`

**Step 1: Create the file with layout shell + sticky jump nav + section anchors**

```astro
---
import Layout from '../layouts/Layout.astro'
import Nav from '../components/Nav.astro'
---

<Layout title="Design System — Subsequent Saturn | Buoy">
  <Nav />

  <!-- Sticky section jump nav -->
  <div class="sticky top-0 z-40 bg-navy-dark/90 backdrop-blur-sm border-b border-navy-light/20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <nav class="flex items-center gap-6 overflow-x-auto py-3 text-sm font-medium scrollbar-hide">
        <a href="#colors" class="text-slate hover:text-light whitespace-nowrap transition-colors">Colors</a>
        <a href="#typography" class="text-slate hover:text-light whitespace-nowrap transition-colors">Typography</a>
        <a href="#spacing" class="text-slate hover:text-light whitespace-nowrap transition-colors">Spacing</a>
        <a href="#effects" class="text-slate hover:text-light whitespace-nowrap transition-colors">Effects</a>
        <a href="#components" class="text-slate hover:text-light whitespace-nowrap transition-colors">Components</a>
        <a href="#patterns" class="text-slate hover:text-light whitespace-nowrap transition-colors">Patterns</a>
      </nav>
    </div>
  </div>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">

    <!-- Hero header -->
    <section class="text-center max-w-3xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30 text-success text-sm font-mono mb-6">
        <span class="w-2 h-2 rounded-full bg-success animate-pulse"></span>
        0 drift issues detected
      </div>
      <h1 class="text-5xl font-extrabold text-light mb-4 font-[Quicksand]">
        Subsequent Saturn<br /><span class="text-buoy">Design System</span>
      </h1>
      <p class="text-slate text-lg">
        Every token, component, and pattern used in buoy-site — documented, live, and continuously checked for drift.
      </p>
    </section>

    <!-- Sections go here (Tasks 2–7) -->

  </main>
</Layout>
```

**Step 2: Verify page loads**

Run: `npm run dev` and open `http://localhost:4321/design-system`
Expected: Page renders with nav, sticky jump bar, and header section.

**Step 3: Commit**

```bash
git add src/pages/design-system.astro
git commit -m "feat: add design system page shell with sticky nav"
```

---

### Task 2: Color Tokens section

**Files:**
- Modify: `src/pages/design-system.astro` — add colors section

**Step 1: Add the full color token section inside `<main>`**

Place after the hero header. Defines all token groups as data arrays and renders swatch cards using only CSS variables and Tailwind token classes (no hardcoded hex in the template).

```astro
---
// Add to frontmatter:
const colorGroups = [
  {
    label: 'Navy',
    tokens: [
      { name: '--color-navy-dark',  tw: 'bg-navy-dark',  label: 'navy-dark',  dark: '#0f1829', light: '#FFFFFF' },
      { name: '--color-navy',       tw: 'bg-navy',       label: 'navy',       dark: '#1a2744', light: '#F0F4F8' },
      { name: '--color-navy-light', tw: 'bg-navy-light', label: 'navy-light', dark: '#243352', light: '#CBD5E1' },
    ]
  },
  {
    label: 'Brand — Buoy Orange',
    tokens: [
      { name: '--color-buoy',       tw: 'bg-buoy',       label: 'buoy',       dark: '#F97316', light: '#F97316' },
      { name: '--color-buoy-light', tw: 'bg-buoy-light', label: 'buoy-light', dark: '#FB923C', light: '#FB923C' },
      { name: '--color-buoy-dark',  tw: 'bg-buoy-dark',  label: 'buoy-dark',  dark: '#EA580C', light: '#EA580C' },
    ]
  },
  {
    label: 'Accent — Lavender',
    tokens: [
      { name: '--color-lavender',       tw: 'bg-lavender',       label: 'lavender',       dark: '#8B5CF6', light: '#6366F1' },
      { name: '--color-lavender-light', tw: 'bg-lavender-light', label: 'lavender-light', dark: '#A78BFA', light: '#818CF8' },
      { name: '--color-sky-purple',     tw: 'bg-sky-purple',     label: 'sky-purple',     dark: '#6366F1', light: '#4F46E5' },
    ]
  },
  {
    label: 'Sunrise',
    tokens: [
      { name: '--color-sunrise',       tw: 'bg-sunrise',       label: 'sunrise',       dark: '#F59E0B', light: '#F59E0B' },
      { name: '--color-sunrise-light', tw: 'bg-sunrise-light', label: 'sunrise-light', dark: '#FBBF24', light: '#FBBF24' },
    ]
  },
  {
    label: 'Text',
    tokens: [
      { name: '--color-light',       tw: 'bg-light',       label: 'light',       dark: '#F8FAFC', light: '#1A2744' },
      { name: '--color-light-muted', tw: 'bg-light-muted', label: 'light-muted', dark: '#E2E8F0', light: '#243352' },
      { name: '--color-slate',       tw: 'bg-slate',       label: 'slate',       dark: '#94A3B8', light: '#475569' },
      { name: '--color-slate-dark',  tw: 'bg-slate-dark',  label: 'slate-dark',  dark: '#64748B', light: '#94A3B8' },
    ]
  },
  {
    label: 'Semantic',
    tokens: [
      { name: '--color-success',  tw: 'bg-success',  label: 'success',  dark: '#10B981', light: '#059669' },
      { name: '--color-warning',  tw: 'bg-warning',  label: 'warning',  dark: '#F59E0B', light: '#D97706' },
      { name: '--color-critical', tw: 'bg-critical', label: 'critical', dark: '#EF4444', light: '#DC2626' },
      { name: '--color-info',     tw: 'bg-info',     label: 'info',     dark: '#3B82F6', light: '#2563EB' },
    ]
  },
]
---
```

```astro
<!-- Colors section (in <main>) -->
<section id="colors" class="scroll-mt-16">
  <h2 class="ds-section-heading">Color Tokens</h2>
  <p class="ds-section-sub">All colors are CSS custom properties under <code class="ds-code">@theme</code> in <code class="ds-code">src/styles/global.css</code>. They respond to light mode automatically.</p>

  <div class="space-y-10 mt-8">
    {colorGroups.map(group => (
      <div>
        <h3 class="text-xs font-semibold text-slate-dark uppercase tracking-widest mb-3">{group.label}</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {group.tokens.map(token => (
            <div class="rounded-xl overflow-hidden border border-navy-light/20 bg-navy/40">
              <div class={`h-20 ${token.tw}`}></div>
              <div class="p-3 space-y-1">
                <div class="font-mono text-xs text-buoy">{token.name}</div>
                <div class="font-mono text-xs text-slate">tw: {token.label}</div>
                <div class="flex gap-2 pt-1">
                  <span class="text-xs text-slate-dark font-mono">◐ {token.dark}</span>
                </div>
                <div class="text-xs text-slate-dark font-mono">☀ {token.light}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
</section>
```

**Step 2: Add shared section styles to `<style>` block at bottom of the file**

```css
<style>
  .ds-section-heading {
    font-size: 1.875rem;
    font-weight: 800;
    color: var(--color-light);
    font-family: var(--font-display);
    margin-bottom: 0.5rem;
  }
  .ds-section-sub {
    color: var(--color-slate);
    max-width: 48rem;
    margin-bottom: 2rem;
  }
  .ds-code {
    font-family: var(--font-mono);
    font-size: 0.875em;
    color: var(--color-buoy);
    background: color-mix(in srgb, var(--color-buoy) 10%, transparent);
    padding: 0.1em 0.4em;
    border-radius: 4px;
  }
  .ds-divider {
    border-color: color-mix(in srgb, var(--color-navy-light) 30%, transparent);
  }
  .scroll-mt-16 { scroll-margin-top: 4rem; }
</style>
```

**Step 3: Verify colors render correctly**

Open `http://localhost:4321/design-system`, confirm swatches are visible and token names shown.

**Step 4: Commit**

```bash
git add src/pages/design-system.astro
git commit -m "feat: add color token swatches to design system page"
```

---

### Task 3: Typography section

**Files:**
- Modify: `src/pages/design-system.astro` — add typography section

**Step 1: Add typography section after colors**

```astro
<section id="typography" class="scroll-mt-16">
  <h2 class="ds-section-heading">Typography</h2>
  <p class="ds-section-sub">Three font families, each with a specific role. Set via CSS variables and applied in <code class="ds-code">global.css</code>.</p>

  <!-- Font Families -->
  <div class="grid md:grid-cols-3 gap-6 mb-12">
    <div class="p-6 bg-navy/40 border border-navy-light/20 rounded-xl">
      <div class="text-xs font-mono text-slate-dark mb-2 uppercase tracking-widest">Display — --font-display</div>
      <div class="text-4xl font-bold text-light" style="font-family: var(--font-display)">Quicksand</div>
      <div class="text-sm text-slate mt-2 font-mono">Quicksand, Satoshi, system-ui</div>
      <div class="mt-3 text-slate text-sm">Headings, hero text, brand moments</div>
    </div>
    <div class="p-6 bg-navy/40 border border-navy-light/20 rounded-xl">
      <div class="text-xs font-mono text-slate-dark mb-2 uppercase tracking-widest">Body — --font-body</div>
      <div class="text-4xl font-bold text-light" style="font-family: var(--font-body)">Inter</div>
      <div class="text-sm text-slate mt-2 font-mono">Inter, system-ui</div>
      <div class="mt-3 text-slate text-sm">Paragraphs, UI labels, descriptions</div>
    </div>
    <div class="p-6 bg-navy/40 border border-navy-light/20 rounded-xl">
      <div class="text-xs font-mono text-slate-dark mb-2 uppercase tracking-widest">Mono — --font-mono</div>
      <div class="text-4xl font-bold text-light" style="font-family: var(--font-mono)">JetBrains</div>
      <div class="text-sm text-slate mt-2 font-mono">JetBrains Mono, Fira Code</div>
      <div class="mt-3 text-slate text-sm">Code, terminal output, token names</div>
    </div>
  </div>

  <!-- Type Scale -->
  <h3 class="text-xs font-semibold text-slate-dark uppercase tracking-widest mb-4">Type Scale</h3>
  <div class="space-y-4 p-6 bg-navy/40 border border-navy-light/20 rounded-xl">
    {[
      { tag: 'h1', size: 'text-5xl',  weight: 'font-extrabold', sample: 'Design Systems at Scale' },
      { tag: 'h2', size: 'text-4xl',  weight: 'font-bold',      sample: 'Token-Driven Components' },
      { tag: 'h3', size: 'text-2xl',  weight: 'font-semibold',  sample: 'Consistent by Default' },
      { tag: 'h4', size: 'text-xl',   weight: 'font-semibold',  sample: 'No Hardcoded Values' },
      { tag: 'p',  size: 'text-base', weight: 'font-normal',    sample: 'Body text reads cleanly at this size. Designed for long-form content and UI descriptions.' },
      { tag: 'small', size: 'text-sm', weight: 'font-normal',   sample: 'Supporting text, captions, helper copy' },
      { tag: 'code', size: 'text-sm', weight: 'font-normal',    sample: 'npx ahoybuoy drift check' },
    ].map(({ tag, size, weight, sample }) => (
      <div class="flex items-baseline gap-6 py-3 border-b border-navy-light/10 last:border-0">
        <div class="w-12 text-xs font-mono text-slate-dark shrink-0">{tag}</div>
        <div class="w-24 text-xs font-mono text-slate shrink-0">{size}</div>
        {tag === 'code'
          ? <code class={`${size} ${weight} text-buoy font-mono`}>{sample}</code>
          : <span class={`${size} ${weight} text-light font-[Quicksand]`}>{sample}</span>
        }
      </div>
    ))}
  </div>
</section>
```

**Step 2: Commit**

```bash
git add src/pages/design-system.astro
git commit -m "feat: add typography section to design system page"
```

---

### Task 4: Spacing & Effects sections

**Files:**
- Modify: `src/pages/design-system.astro`

**Step 1: Add Spacing section**

```astro
<section id="spacing" class="scroll-mt-16">
  <h2 class="ds-section-heading">Spacing</h2>
  <p class="ds-section-sub">Section spacing tokens. Element-level spacing uses Tailwind's default scale.</p>

  <div class="space-y-4 mt-8">
    {[
      { name: '--spacing-section',    value: '6rem',  tw: 'py-[var(--spacing-section)]',    label: 'Section padding — desktop' },
      { name: '--spacing-section-sm', value: '4rem',  tw: 'py-[var(--spacing-section-sm)]', label: 'Section padding — mobile' },
    ].map(token => (
      <div class="flex items-center gap-6 p-4 bg-navy/40 border border-navy-light/20 rounded-xl">
        <div class="shrink-0 bg-buoy/20 border border-buoy/30 rounded flex items-center justify-center"
          style={`width: ${token.value}; height: 2rem; min-width: 2rem`}>
        </div>
        <div>
          <div class="font-mono text-sm text-buoy">{token.name}</div>
          <div class="font-mono text-xs text-slate-dark mt-0.5">{token.value} — {token.label}</div>
        </div>
      </div>
    ))}
  </div>
</section>
```

**Step 2: Add Effects section**

```astro
<section id="effects" class="scroll-mt-16">
  <h2 class="ds-section-heading">Effects</h2>
  <p class="ds-section-sub">Glow utilities, text gradients, and animation classes defined in <code class="ds-code">global.css</code>.</p>

  <div class="grid md:grid-cols-2 gap-6 mt-8">
    <!-- Glows -->
    <div class="space-y-4">
      <h3 class="text-xs font-semibold text-slate-dark uppercase tracking-widest">Glows</h3>
      <div class="flex flex-col gap-4">
        <div class="p-4 bg-navy/40 border border-navy-light/20 rounded-xl flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-buoy glow-buoy"></div>
          <div>
            <div class="font-mono text-sm text-light">.glow-buoy</div>
            <div class="font-mono text-xs text-slate-dark">box-shadow: 0 0 30px buoy/40%</div>
          </div>
        </div>
        <div class="p-4 bg-navy/40 border border-navy-light/20 rounded-xl flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-lavender glow-lavender"></div>
          <div>
            <div class="font-mono text-sm text-light">.glow-lavender</div>
            <div class="font-mono text-xs text-slate-dark">box-shadow: 0 0 30px lavender/30%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Text Gradients -->
    <div class="space-y-4">
      <h3 class="text-xs font-semibold text-slate-dark uppercase tracking-widest">Text Gradients</h3>
      <div class="p-4 bg-navy/40 border border-navy-light/20 rounded-xl">
        <div class="text-3xl font-extrabold text-gradient-sunrise font-[Quicksand] mb-2">Catch Design Drift</div>
        <div class="font-mono text-xs text-slate-dark">.text-gradient-sunrise</div>
        <div class="font-mono text-xs text-slate-dark mt-1">buoy → sunrise → lavender at 135°</div>
      </div>
    </div>

    <!-- Animations -->
    <div class="space-y-4 md:col-span-2">
      <h3 class="text-xs font-semibold text-slate-dark uppercase tracking-widest">Animations</h3>
      <div class="grid sm:grid-cols-3 gap-4">
        {[
          { cls: 'animate-float',      label: '.animate-float',      desc: '6s ease-in-out infinite — vertical bob' },
          { cls: 'animate-pulse-glow', label: '.animate-pulse-glow', desc: '3s ease-in-out infinite — opacity pulse' },
          { cls: 'animate-wave',       label: '.animate-wave',       desc: '8s ease-in-out infinite — lateral sway' },
        ].map(anim => (
          <div class="p-4 bg-navy/40 border border-navy-light/20 rounded-xl text-center">
            <div class={`text-4xl mb-3 ${anim.cls}`}>⛵</div>
            <div class="font-mono text-sm text-light">{anim.label}</div>
            <div class="font-mono text-xs text-slate-dark mt-1">{anim.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
```

**Step 3: Commit**

```bash
git add src/pages/design-system.astro
git commit -m "feat: add spacing and effects sections to design system page"
```

---

### Task 5: Components section — Button + FeatureCard

**Files:**
- Modify: `src/pages/design-system.astro`
- Add import: `Button`, `FeatureCard`

**Step 1: Add imports to frontmatter**

```astro
import Button from '../components/Button.astro'
import FeatureCard from '../components/FeatureCard.astro'
```

**Step 2: Add Button showcase**

```astro
<section id="components" class="scroll-mt-16">
  <h2 class="ds-section-heading">Components</h2>
  <p class="ds-section-sub">Live instances of every component, every variant. No mocks — what you see is what ships.</p>

  <!-- Button -->
  <div class="mb-16">
    <h3 class="text-xs font-semibold text-slate-dark uppercase tracking-widest mb-6">Button — <code class="ds-code">src/components/Button.astro</code></h3>

    <!-- Variants × Sizes matrix -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left border-b border-navy-light/20">
            <th class="pb-3 pr-6 font-mono text-xs text-slate-dark">variant / size</th>
            <th class="pb-3 pr-6 font-mono text-xs text-slate-dark">sm</th>
            <th class="pb-3 pr-6 font-mono text-xs text-slate-dark">md (default)</th>
            <th class="pb-3 font-mono text-xs text-slate-dark">lg</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-navy-light/10">
          {(['primary', 'secondary', 'ghost'] as const).map(variant => (
            <tr>
              <td class="py-4 pr-6 font-mono text-xs text-slate">{variant}</td>
              <td class="py-4 pr-6"><Button variant={variant} size="sm">Label</Button></td>
              <td class="py-4 pr-6"><Button variant={variant} size="md">Label</Button></td>
              <td class="py-4"><Button variant={variant} size="lg">Label</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <!-- Token reference -->
    <div class="mt-4 p-4 bg-navy-dark/60 border border-navy-light/10 rounded-lg font-mono text-xs text-slate-dark">
      <div class="text-slate mb-2">Token usage inside Button.astro:</div>
      <div>primary: <span class="text-buoy">bg-buoy</span> text-navy-dark hover:bg-buoy-light glow-buoy</div>
      <div>secondary: <span class="text-lavender">bg-navy-light/50</span> text-light border-navy-light/50</div>
      <div>ghost: text-slate hover:text-light hover:bg-navy-light/30</div>
    </div>
  </div>

  <!-- FeatureCard -->
  <div class="mb-16">
    <h3 class="text-xs font-semibold text-slate-dark uppercase tracking-widest mb-6">FeatureCard — <code class="ds-code">src/components/FeatureCard.astro</code></h3>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <FeatureCard
        title="With Link"
        description="Cards with href get a hover glow, clickable title, and a 'Learn more' CTA at the bottom."
        icon="🛟"
        href="/features/drift-detection"
        examples={['token.violation', 'hardcoded.value']}
      />
      <FeatureCard
        title="Without Link"
        description="Static cards omit the link affordance entirely. Same token usage throughout."
        icon="⚓"
        examples={['pattern.match', 'rule.enforced']}
      />
      <FeatureCard
        title="Minimal"
        description="No icon, no examples, no link. Just a title and description using the same border and bg tokens."
      />
    </div>
  </div>
</section>
```

**Step 3: Commit**

```bash
git add src/pages/design-system.astro
git commit -m "feat: add Button and FeatureCard component showcases"
```

---

### Task 6: Components section — Terminal + status badges

**Files:**
- Modify: `src/pages/design-system.astro`
- Add import: `Terminal`

**Step 1: Add Terminal import**

```astro
import Terminal from '../components/Terminal.astro'
```

**Step 2: Add Terminal + badges inside the components section**

```astro
  <!-- Terminal -->
  <div class="mb-16">
    <h3 class="text-xs font-semibold text-slate-dark uppercase tracking-widest mb-6">Terminal — <code class="ds-code">src/components/Terminal.astro</code></h3>
    <div class="max-w-2xl">
      <Terminal
        command="npx ahoybuoy drift check"
        lines={[
          { text: '', type: 'output', delay: 400 },
          { text: '🛟 Scanning <span class="text-buoy">design-system.astro</span>...', type: 'output', delay: 600 },
          { text: '', type: 'output', delay: 800 },
          { text: '<span class="text-success font-semibold">✓ 0 issues found</span>', type: 'success', delay: 1000 },
          { text: '', type: 'output', delay: 1200 },
          { text: 'All tokens resolve to design system values.', type: 'muted', delay: 1400 },
          { text: 'No hardcoded colors, spacing, or typography.', type: 'muted', delay: 1600 },
        ]}
      />
    </div>
    <div class="mt-4 p-4 bg-navy-dark/60 border border-navy-light/10 rounded-lg font-mono text-xs">
      <div class="text-slate mb-2">Line type → color token mapping:</div>
      {[
        { type: 'output',   color: 'text-slate',     token: '--color-slate' },
        { type: 'success',  color: 'text-success',   token: '--color-success' },
        { type: 'warning',  color: 'text-warning',   token: '--color-warning' },
        { type: 'critical', color: 'text-critical',  token: '--color-critical' },
        { type: 'info',     color: 'text-info',      token: '--color-info' },
        { type: 'muted',    color: 'text-slate-dark', token: '--color-slate-dark' },
      ].map(row => (
        <div class="flex gap-4 py-0.5">
          <span class="w-16 text-slate-dark">{row.type}</span>
          <span class={`w-32 ${row.color}`}>{row.color}</span>
          <span class="text-slate-dark">{row.token}</span>
        </div>
      ))}
    </div>
  </div>

  <!-- Status badges -->
  <div class="mb-16">
    <h3 class="text-xs font-semibold text-slate-dark uppercase tracking-widest mb-6">Status Badges</h3>
    <div class="flex flex-wrap gap-3">
      {[
        { label: 'success',  bg: 'bg-success/10',  border: 'border-success/30',  text: 'text-success',  dot: 'bg-success'  },
        { label: 'warning',  bg: 'bg-warning/10',  border: 'border-warning/30',  text: 'text-warning',  dot: 'bg-warning'  },
        { label: 'critical', bg: 'bg-critical/10', border: 'border-critical/30', text: 'text-critical', dot: 'bg-critical' },
        { label: 'info',     bg: 'bg-info/10',     border: 'border-info/30',     text: 'text-info',     dot: 'bg-info'     },
      ].map(badge => (
        <div class={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${badge.bg} border ${badge.border} ${badge.text} text-sm font-medium`}>
          <span class={`w-2 h-2 rounded-full ${badge.dot}`}></span>
          {badge.label}
        </div>
      ))}
    </div>
  </div>
```

**Step 3: Commit**

```bash
git add src/pages/design-system.astro
git commit -m "feat: add Terminal and status badge showcases"
```

---

### Task 7: Patterns section + buoy check CTA footer

**Files:**
- Modify: `src/pages/design-system.astro`

**Step 1: Add Patterns section and closing CTA**

```astro
<section id="patterns" class="scroll-mt-16">
  <h2 class="ds-section-heading">Patterns</h2>
  <p class="ds-section-sub">Recurring compositions built from the token primitives above.</p>

  <div class="space-y-8 mt-8">

    <!-- Section header pattern -->
    <div class="p-6 bg-navy/40 border border-navy-light/20 rounded-xl">
      <div class="text-xs font-semibold text-slate-dark uppercase tracking-widest mb-4">Section Header</div>
      <div class="border-l-2 border-buoy pl-4">
        <h2 class="text-2xl font-bold text-light font-[Quicksand]">Section Title</h2>
        <p class="text-slate mt-1">Supporting description in text-slate. Always below the heading, never above.</p>
      </div>
      <div class="mt-4 font-mono text-xs text-slate-dark">border-buoy / text-light (display) / text-slate (body)</div>
    </div>

    <!-- Code inline pattern -->
    <div class="p-6 bg-navy/40 border border-navy-light/20 rounded-xl">
      <div class="text-xs font-semibold text-slate-dark uppercase tracking-widest mb-4">Inline Code</div>
      <p class="text-slate">Run <code class="ds-code">npx ahoybuoy drift check</code> in your repo root. It reads <code class="ds-code">buoy.config.mjs</code> automatically.</p>
      <div class="mt-4 font-mono text-xs text-slate-dark">font-mono / text-buoy / bg-buoy/10 / rounded-sm</div>
    </div>

    <!-- CTA row pattern -->
    <div class="p-6 bg-navy/40 border border-navy-light/20 rounded-xl">
      <div class="text-xs font-semibold text-slate-dark uppercase tracking-widest mb-4">CTA Row</div>
      <div class="flex flex-wrap gap-3">
        <Button href="#" size="lg">Primary Action</Button>
        <Button href="#" variant="secondary" size="lg">Secondary Action</Button>
        <Button href="#" variant="ghost" size="lg">Ghost Action</Button>
      </div>
      <div class="mt-4 font-mono text-xs text-slate-dark">Always primary first, secondary second, ghost third. Gap-3 between.</div>
    </div>

  </div>
</section>

<!-- Footer CTA — run buoy check on this page -->
<section class="text-center py-16 border-t border-navy-light/20">
  <div class="text-4xl mb-4">🛟</div>
  <h2 class="text-2xl font-bold text-light font-[Quicksand] mb-2">This page is the test</h2>
  <p class="text-slate mb-6 max-w-lg mx-auto">Every element above uses only design system tokens. Run buoy check against it anytime to confirm zero drift.</p>
  <div class="inline-flex items-center gap-3 px-4 py-3 bg-navy/80 border border-navy-light/30 rounded-lg font-mono text-sm">
    <span class="text-slate">$</span>
    <code class="text-light">npx ahoybuoy drift check src/pages/design-system.astro</code>
  </div>
</section>
```

**Step 2: Final check — run buoy against the new page**

```bash
npx ahoybuoy drift check src/pages/design-system.astro
```
Expected: 0 issues (all values use tokens)

**Step 3: Final commit**

```bash
git add src/pages/design-system.astro
git commit -m "feat: add patterns section and complete design system showcase page"
```

---

## Summary

7 tasks, 7 commits. Result: a live `/design-system` page that:
- Documents every token visually + in code
- Shows every component variant live
- Uses zero hardcoded values (buoy check clean)
- Serves as the canonical drift baseline for the site
