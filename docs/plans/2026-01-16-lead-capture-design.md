# Lead Capture Strategy Design

**Date:** 2026-01-16
**Goal:** Qualify leads by capturing emails from problem-aware visitors
**Approach:** Contextual lead magnets placed throughout the site

---

## Overview

Add lead capture sections across the site, matching each lead magnet to pages where visitors are most likely to find it relevant. Use PostHog feature flags for A/B testing on the homepage.

---

## Part 1: Homepage Lead Capture

### Placement
New section between Problem Statement ("Design systems leak") and Terminal Demo ("Find drift in seconds").

**Page flow:**
1. Hero
2. Problem Statement (code comparison)
3. **→ NEW: Lead Capture Section ←**
4. Terminal Demo

### Design

**Layout:** Two-column on desktop (copy left, preview right), stacked on mobile.

**Copy:**
- Headline: "Think your codebase might have drift?"
- Subhead: "Get the checklist. 20 warning signs to spot in your next code review."
- CTA: `[email input]` `[Get the Checklist]`
- Trust signal: "No spam. Free PDF."

**A/B Test (PostHog feature flags):**
- **Variant A (control):** Drift Checklist
- **Variant B:** Why Developers Bypass
- **Variant C:** Maturity Model

Track: `lead_magnet_download` event (already implemented) + variant in properties.

---

## Part 2: Site-Wide Contextual Placements

### Drift Checklist (20 warning signs)
*Audience: People who want to self-diagnose*

| Page | Placement |
|------|-----------|
| `/features/drift-detection` | End of page CTA |
| `/compare/manual-audits` | Inline - "If you're doing manual audits, use this checklist" |
| `/use-cases/frontend-teams` | Bottom CTA |

### Hall of Shame (Hardcoded color examples)
*Audience: Entertainment + problem recognition*

| Page | Placement |
|------|-----------|
| `/features/hardcoded-values` | Mid-page callout |

### PR Review Cheatsheet
*Audience: People setting up process/CI*

| Page | Placement |
|------|-----------|
| `/features/ci` | End CTA |
| `/features/github-action` | Inline callout |
| `/docs/integrations/github-actions` | End of docs |

### Maturity Model (Self-assessment)
*Audience: Managers, team leads*

| Page | Placement |
|------|-----------|
| `/use-cases/design-system-teams` | Hero or mid-page |
| `/use-cases/enterprise` | Bottom CTA |
| `/features/coverage` | End CTA |
| `/pricing` | Below plans - "Not sure what tier? Assess first" |

### Why Developers Bypass (Educational)
*Audience: Design system maintainers*

| Page | Placement |
|------|-----------|
| `/use-cases/design-system-teams` | Mid-page callout (alternate with Maturity Model) |
| `/about` | Bottom section |

### Token Migration Playbook
*Audience: Teams actively migrating*

| Page | Placement |
|------|-----------|
| `/use-cases/modernization` | Hero-level CTA |
| `/docs/cli/tokens` | Inline callout |
| `/integrations/tailwind` | End CTA |

### State of Design Systems 2026 (Industry report)
*Audience: Executives, thought leadership*

| Page | Placement |
|------|-----------|
| `/use-cases/enterprise` | Mid-page callout |
| `/integrations/figma` | End CTA |
| `/about` | Thought leadership section |

---

## Implementation Components

### New Components Needed

1. **`LeadCaptureSection.astro`** - Full-width homepage section with two-column layout
2. **`LeadMagnetCallout.astro`** - Inline callout for mid-page placements (smaller, fits in content flow)
3. **`LeadMagnetCTA.astro`** - End-of-page CTA block (larger, standalone)

All components should:
- Accept `leadMagnet` prop to specify which magnet
- Use existing `LeadMagnetForm.astro` internally
- Support custom headlines/copy via props
- Track via existing PostHog events

### PostHog Feature Flag Setup

Flag name: `homepage-lead-magnet-variant`

Variants:
- `drift-checklist` (34%)
- `why-developers-bypass` (33%)
- `maturity-model` (33%)

---

## Success Metrics

- **Primary:** Lead magnet downloads (by variant, by page)
- **Secondary:** Email list growth rate
- **Tertiary:** Downstream conversion to CLI install / dashboard signup

---

## Implementation Order

1. Create `LeadCaptureSection` component
2. Add to homepage (with PostHog flag integration)
3. Create `LeadMagnetCallout` component
4. Create `LeadMagnetCTA` component
5. Roll out to feature pages
6. Roll out to use-case pages
7. Roll out to docs/integration pages
