# React Best Practices

## Structure

```
react-best-practices/
  SKILL.md       # Main skill file - read this first
  AGENTS.md      # This navigation guide
  CLAUDE.md      # Symlink to AGENTS.md
  README.md      # Contributor guide
  references/    # Detailed reference files
    ui-components/   # All component rules
```

## Usage

1. Read `SKILL.md` for the main skill instructions
2. Browse `references/ui-components/` for detailed documentation on specific topics
3. Reference files are loaded on-demand — read only what you need

Comprehensive React UI component guide for Tailwind CSS and Radix UI stacks. Contains rules across 7 categories, prioritized by impact to guide component authoring, code generation, and reviews.

## When to Apply

Reference these guidelines when:

- Writing or reviewing React UI components
- Designing component props APIs
- Implementing stateful (controlled/uncontrolled) components
- Applying Tailwind CSS classes and design tokens
- Building compound or multi-part components
- Reviewing accessibility of interactive elements
- Structuring component files

## Rule Categories by Priority

| Priority | Category                  | Impact      | Files                                                                                           |
| -------- | ------------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| 1        | Component API Design      | CRITICAL    | `props-api.md`, `controlled-uncontrolled.md`, `ref-as-prop-react-19.md`, `arrow-syntax-only.md` |
| 2        | Design System & Tokens    | HIGH        | `design-tokens.md`                                                                              |
| 3        | Accessibility & UX States | HIGH        | `interactive-states.md`                                                                         |
| 4        | Styling Patterns          | MEDIUM-HIGH | `cn-classnames.md`, `variants.md`                                                               |
| 5        | Component Architecture    | MEDIUM-HIGH | `compound-components.md`, `context-shared-state.md`                                             |
| 6        | Code Organization         | MEDIUM      | `file-structure.md`, `typography.md`                                                            |
| 7        | Animation & Motion        | LOW         | `transitions.md`                                                                                |

## How to Use

Read individual rule files from `references/ui-components/`:

```
references/ui-components/props-api.md
references/ui-components/design-tokens.md
references/ui-components/interactive-states.md
references/_sections.md
```

Each rule file contains:

- Brief explanation of why it matters
- Incorrect TSX example with explanation
- Correct TSX example with explanation
- Optional reference table or metrics
- Additional context and trade-offs

## References

- https://react.dev/
- https://www.radix-ui.com/primitives/docs/overview/introduction
- https://tailwindcss.com/docs
- https://github.com/dcastil/tailwind-merge
- https://github.com/lukeed/clsx
