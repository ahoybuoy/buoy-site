# Comparison Pages Draft

Use these to create pages at:
- `/compare/coderabbit`
- `/compare/greptile`

---

## Buoy vs CodeRabbit

### Hero

**Buoy + CodeRabbit = Design System Compliance**

CodeRabbit reviews your code. Buoy teaches it your design system.

### The Difference

| | CodeRabbit | Buoy |
|---|---|---|
| **Focus** | Code quality, bugs, security | Design system compliance |
| **Knows** | General best practices | Your specific tokens & patterns |
| **Catches** | Logic errors, security issues | `#3b82f6` instead of `--color-primary` |
| **Output** | PR comments | PR comments + token suggestions |

### Better Together

CodeRabbit is great at code review. But it doesn't know that `#3b82f6` should be `var(--color-primary)` in YOUR codebase.

Buoy fills that gap:

```bash
# Export your design system rules to CodeRabbit
buoy lighthouse --export-coderabbit
```

This generates `.coderabbit.yaml` rules that teach CodeRabbit your design tokens.

### How It Works

1. **Buoy scans** your design system (tokens, components, patterns)
2. **Buoy exports** rules in CodeRabbit's format
3. **CodeRabbit enforces** your design system in every PR

### What Each Tool Catches

**CodeRabbit catches:**
- Unused variables
- Security vulnerabilities
- Performance issues
- Code style violations

**Buoy catches:**
- Hardcoded colors (`#ff0000` → `var(--color-error)`)
- Magic numbers (`padding: 17px` → `var(--spacing-4)`)
- Tailwind arbitrary values (`p-[13px]` → `p-4`)
- Component naming drift
- Design token misuse

### Pricing Comparison

| | CodeRabbit | Buoy |
|---|---|---|
| Free tier | Yes | Yes |
| Open source | Free | Free |
| Pro | $15/user/mo | $X/mo |

### Get Started

Already using CodeRabbit? Add Buoy in 2 minutes:

```bash
npx ahoybuoy begin
buoy lighthouse --export-coderabbit
```

Your design system is now part of every code review.

---

## Buoy vs Greptile

### Hero

**Buoy + Greptile = Codebase-Aware Design Reviews**

Greptile understands your codebase. Buoy adds design system expertise.

### The Difference

| | Greptile | Buoy |
|---|---|---|
| **Focus** | Codebase understanding | Design system compliance |
| **Strength** | Semantic code search, context | Token matching, pattern detection |
| **Learns from** | Your entire codebase | Your design tokens & components |
| **Reviews** | Code logic & patterns | Design consistency |

### Better Together

Greptile builds a semantic graph of your codebase. Buoy adds design system context to that graph.

```bash
# Export design system context for Greptile
buoy lighthouse --export-greptile
```

This generates custom context that Greptile uses in reviews.

### How It Works

1. **Greptile indexes** your codebase (understands relationships)
2. **Buoy provides** design system context (tokens, patterns, anti-patterns)
3. **Greptile reviews** with full design system awareness

### What Each Tool Catches

**Greptile catches:**
- Logic inconsistencies
- Pattern violations
- Missing error handling
- Code that contradicts existing patterns

**Buoy catches:**
- Hardcoded design values
- Token misuse
- Component drift
- Design system anti-patterns

### The Greptile + Buoy Workflow

Greptile learns from your team:
- Watches which comments get 👍/👎
- Learns from developer replies
- Adapts to your preferences

Buoy adds design expertise:
- Knows your exact token values
- Tracks component patterns
- Flags design system violations

Together: Reviews that understand both your code AND your design system.

### Auto-Learning

Greptile reads these files automatically:
- `CLAUDE.md`
- `.cursorrules`
- `agents.md`

Run `buoy onboard` to add design system context to `CLAUDE.md` - Greptile picks it up automatically.

### Get Started

Already using Greptile? Add Buoy context:

```bash
npx ahoybuoy begin
buoy onboard  # Updates CLAUDE.md - Greptile reads this!
```

Or export dedicated Greptile config:

```bash
buoy lighthouse --export-greptile > greptile-buoy.json
```

---

## Shared Messaging Points

### "Works WITH, not against"

Buoy is not another AI code reviewer. It's a design system expert that makes your existing tools smarter.

### "Notify first, block if asked"

By default, Buoy comments and suggests. You choose whether to block PRs.

### "Design system expertise"

General AI tools know code. Buoy knows YOUR design system - your tokens, your patterns, your rules.

### Key differentiator

Other tools: "This code has issues"
Buoy: "This code uses #3b82f6 but your design system has --color-primary for that exact shade"
