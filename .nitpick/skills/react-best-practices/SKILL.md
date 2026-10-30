---
name: react-best-practices
description: React UI component best practices for building consistent, accessible, and maintainable component libraries. Use this skill when writing, reviewing, or optimizing React components, styling patterns, or component APIs.
license: MIT
metadata:
  author: polubis
  version: '1.0.0'
  organization: gon-stack
  date: April 2026
  abstract: Comprehensive React UI component best practices guide for Tailwind CSS + Radix UI stacks. Contains rules across 7 categories, prioritized by impact from critical (component API design) to incremental (animation). Each rule includes incorrect vs. correct TSX examples with explanations to guide automated code generation and component review.
---

# React Best Practices

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

| Priority | Category                  | Impact      | Directory                                                                                                                                   |
| -------- | ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | Component API Design      | CRITICAL    | `ui-components/props-api`, `ui-components/controlled-uncontrolled`, `ui-components/ref-as-prop-react-19`, `ui-components/arrow-syntax-only` |
| 2        | Design System & Tokens    | HIGH        | `ui-components/design-tokens`                                                                                                               |
| 3        | Accessibility & UX States | HIGH        | `ui-components/interactive-states`                                                                                                          |
| 4        | Styling Patterns          | MEDIUM-HIGH | `ui-components/cn-classnames`, `ui-components/variants`                                                                                     |
| 5        | Component Architecture    | MEDIUM-HIGH | `ui-components/compound-components`, `ui-components/context-shared-state`                                                                   |
| 6        | Code Organization         | MEDIUM      | `ui-components/file-structure`, `ui-components/typography`                                                                                  |
| 7        | Animation & Motion        | LOW         | `ui-components/transitions`                                                                                                                 |

## How to Use

Read individual rule files for detailed explanations and TSX examples:

```
references/ui-components/props-api.md
references/ui-components/design-tokens.md
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
