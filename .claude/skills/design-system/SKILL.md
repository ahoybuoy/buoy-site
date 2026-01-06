---
name: subsequent-saturn-design-system
description: Use when writing UI code for Subsequent Saturn. Provides tokens, components, and patterns to maintain design consistency.
---

# Subsequent Saturn Design System

## Quick Reference

### Colors
- No color tokens detected

### Spacing
- No spacing tokens detected

## Components (0)


## Rules

1. **NEVER hardcode colors** - Always use design tokens
2. **NEVER hardcode spacing** - Use the spacing scale
3. **USE existing components** - Check the list above before creating new ones
4. **RUN validation** - Execute `buoy check` before committing

## Validation

Before committing any UI code:
```bash
buoy check
```

For detailed drift report:
```bash
buoy drift check
```

## More Details

See the token files in this directory for complete reference:
- `tokens/colors.md` - All color tokens
- `tokens/spacing.md` - Spacing scale
