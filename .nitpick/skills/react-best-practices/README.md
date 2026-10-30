# React Best Practices - Contributor Guide

This skill contains React UI component best practice references optimized for
AI agents and LLMs. It follows the [Agent Skills Open Standard](https://agentskills.io/).

## Skill Structure

```
react-best-practices/
├── SKILL.md           # Agent-facing skill manifest
├── AGENTS.md          # Compiled navigation document
├── CLAUDE.md          # Symlink to AGENTS.md
├── README.md          # This file
└── references/
    └── ui-components/     # All component rule files
        ├── _template.md      # Reference template
        ├── _sections.md      # Section definitions
        ├── _contributing.md  # Writing guidelines
        └── *.md              # Individual references
```

## Creating a New Reference

1. **Choose a section** based on the category:
   - Component API Design (CRITICAL) — props, controlled/uncontrolled patterns
   - Design System & Tokens (HIGH) — CSS custom properties, theming
   - Accessibility & UX States (HIGH) — hover, focus, disabled, active
   - Styling Patterns (MEDIUM-HIGH) — cn(), variants, Tailwind utilities
   - Component Architecture (MEDIUM-HIGH) — compound components, context
   - Code Organization (MEDIUM) — file structure, typography
   - Animation & Motion (LOW) — transitions, timing

2. **Copy the template**:

   ```bash
   cp references/ui-components/_template.md references/ui-components/your-rule-name.md
   ```

3. **Fill in the content** following the template structure

4. **Update `AGENTS.md`** to reference the new file in the appropriate category row

5. **Review** the generated output

## Reference File Structure

See `references/ui-components/_template.md` for the complete template. Key elements:

````markdown
---
title: Clear, Action-Oriented Title
impact: CRITICAL|HIGH|MEDIUM-HIGH|MEDIUM|LOW-MEDIUM|LOW
impactDescription: Quantified benefit (e.g., "Prevents class conflicts and merge issues")
tags: relevant, keywords
---

## [Title]

[1-2 sentence explanation]

**❌ Incorrect (description):**

```tsx
// Comment explaining what's wrong
[Bad TSX example]
```

**✅ Correct (description):**

```tsx
// Comment explaining why this is better
[Good TSX example]
```
````

## Writing Guidelines

See `references/ui-components/_contributing.md` for detailed guidelines. Key principles:

1. **Show concrete transformations** — "Change X to Y", not abstract advice
2. **Error-first structure** — Show the problem before the solution
3. **Quantify impact** — Include specific benefits (e.g. "caller gets full native API")
4. **Self-contained examples** — Complete, renderable TSX
5. **Semantic naming** — Use meaningful names (`Button`, `variant`, `onValueChange`), not (`Comp`, `x`, `fn`)

## Impact Levels

| Level       | Improvement     | Examples                                          |
| ----------- | --------------- | ------------------------------------------------- |
| CRITICAL    | Breaks usage    | Missing native props, no controlled/uncontrolled  |
| HIGH        | Major UX gap    | Hardcoded colors, missing focus/disabled states   |
| MEDIUM-HIGH | API friction    | Object maps vs cn(), prop-drilling instead of ctx |
| MEDIUM      | Maintainability | No file sections, wrong typography scope          |
| LOW-MEDIUM  | Consistency     | Missing transitions                               |
| LOW         | Polish          | Wrong animation duration                          |
