---
version: alpha
name: Buoy Marketing Site
description: Visual identity for buoy.design — the Buoy marketing and docs site.
colors:
  primary: "#F97316"
  primary-light: "#FB923C"
  primary-dark: "#EA580C"
  surface: "#1A2744"
  surface-dark: "#0F1829"
  surface-light: "#243352"
  accent: "#8B5CF6"
  accent-light: "#A78BFA"
  background: "#F8FAFC"
  background-muted: "#E2E8F0"
  text-muted: "#94A3B8"
  text-strong: "#64748B"
  success: "#10B981"
  warning: "#F59E0B"
  critical: "#EF4444"
  info: "#3B82F6"
typography:
  display:
    fontFamily: Quicksand
    fontSize: 3rem
    fontWeight: 700
  body:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
  mono:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: 400
spacing:
  section: 6rem
  section-sm: 4rem
rounded:
  sm: 4px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.sm}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.background}"
---

## Overview

Buoy's marketing voice is _confident, technical, and warm_. The visual identity pairs **deep navy surfaces** with a **signature orange** that nods to the lifebuoy metaphor without being literal. Background-first layouts give the site a clean, technical feel — UI that gets out of the way of the content.

## Colors

The palette is built around three layers:

- **Surface (navy)** — `#1A2744` and its dark/light siblings carry hero sections, CTAs, and grounded UI elements. Dark by default; high contrast against the orange.
- **Primary (orange)** — `#F97316` is the only color used for interaction. CTAs, links, focus states. Used sparingly so it always reads as "do this."
- **Accent (lavender)** — `#8B5CF6` is a secondary highlight for non-primary call-outs (release notes, feature flags). Never used for interaction.

Background and text colors are slate-based grays — neutral, no warmth, deliberately understated.

## Typography

- **Quicksand** for display and headings — rounded geometric sans, signals approachability without being playful.
- **Inter** for body — workhorse system font, optimized for screen reading.
- **JetBrains Mono** for code — distinct from body, signals "this is technical content."

## Layout & Spacing

The site is content-led. Section spacing is generous (`6rem` between major blocks, `4rem` on mobile) to prevent the marketing site from feeling like a dashboard. No uniform spacing scale — sections are intentionally large.

## Components

- **`button-primary`** is the only interactive component pattern. Orange background, light text, 12px padding, 4px radius. Hover state shifts to the dark orange — never to the light variant.

## Do's and Don'ts

- **Do** keep orange exclusive to interaction. If everything is orange, nothing is.
- **Do** ship dark surfaces by default. The site is a navy site that lights up with orange.
- **Don't** introduce a third interactive color. Lavender stays decorative.
- **Don't** use the `critical` red outside of error states. It reads as "something broke" — preserve that signal.
