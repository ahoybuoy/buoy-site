# AI Integration Feature - Marketing Copy

Use this to create a page at `/features/ai-integration` or add to the homepage.

---

## Hero

**Your Design System, In Every AI Session**

Buoy onboards AI coding assistants to your design system. Claude, Cursor, Copilot - they all learn your tokens, patterns, and rules.

## The Problem

AI coding assistants are brilliant at writing code. But they don't know YOUR design system.

They'll happily write:
```jsx
<div style={{ color: '#3b82f6', padding: '17px' }}>
```

When they should write:
```jsx
<div style={{ color: 'var(--color-primary)', padding: 'var(--spacing-4)' }}>
```

Every hardcoded value is drift. Every drift is technical debt.

## The Solution

```bash
buoy onboard
```

One command. Your AI assistant now knows:
- Your design tokens (colors, spacing, typography)
- Your component patterns (how buttons, cards, forms work)
- Your anti-patterns (what to avoid)

## How It Works

### 1. Scans Your Design System

Buoy analyzes your codebase to find:
- CSS variables, SCSS tokens, JSON token files
- Component implementations across React, Vue, Svelte, Angular
- Existing patterns and anti-patterns

### 2. Generates AI Context

Creates skill files and context that AI tools understand:
- `.claude/skills/design-system/` for Claude Code
- Updates `CLAUDE.md` (auto-read by Greptile, Cursor, etc.)
- Session hooks for real-time reminders

### 3. Enforcement Layers

| Layer | When | What |
|-------|------|------|
| **Context** | Generation | AI knows tokens before writing code |
| **Session hooks** | Session start | Reminder about design system |
| **On-demand** | Anytime | `buoy check` validates specific files |
| **Pre-commit** | Before commit | Catches drift before it lands |

## Supported AI Tools

### Real-time Integration

| Tool | What Buoy Does |
|------|----------------|
| **Claude Code** | `.claude/settings.local.json` + skill files |
| **OpenCode** | Plugin with `file.edited` event |
| **Cursor** | Updates `.cursorrules` with token context |
| **Windsurf** | Updates `.windsurfrules` with patterns |

### PR Review Integration

| Tool | What Buoy Does |
|------|----------------|
| **Greptile** | Auto-reads CLAUDE.md with design context |
| **CodeRabbit** | Export rules via `--export-coderabbit` |

## Zero Overhead

Unlike linters that run on every keystroke, Buoy is smart about when to check:

- **Session start**: Quick reminder, zero latency during work
- **On-demand**: Run `buoy check` when you want validation
- **Pre-commit**: Catch everything before it lands

No slowdown. No friction. Just guardrails.

## Get Started

```bash
# Install buoy
npm install -g ahoybuoy

# Onboard your AI assistants
buoy onboard

# Optionally set up pre-commit hooks
buoy dock --hooks
```

Your AI assistant is now part of the crew.

---

## Messaging Points

### "Teach, don't block"

Buoy teaches AI your design system upfront. It doesn't just catch mistakes - it prevents them by giving AI the context it needs to get it right the first time.

### "Works with your tools"

Not another tool to install. Buoy enhances the AI tools you already use - Claude, Cursor, Copilot, Greptile, CodeRabbit.

### "Zero overhead architecture"

Session-start context injection, not per-keystroke linting. Your AI stays fast while staying on-brand.

---

## Social Proof Angles

- "How we reduced design drift by 80% with AI-generated code"
- "The missing piece in AI-assisted development"
- "From AI chaos to design system compliance in one command"

---

## Call to Action

**Ready to onboard your AI?**

```bash
npx ahoybuoy begin
```

Free. Open source. No signup required.
