---
ticket: none
scope: parka/ui
summary: All selects use one Radix Select
why: Native selects looked and behaved differently per browser/OS and ignored the app theme
date: 2026-10-11
tags: [ui, select, a11y, radix]
---

- `Select` in `shared/ui/controls.tsx` now wraps `@radix-ui/react-select`: `options`, `value`, `onValueChange`, `placeholder`; label via `Field`, trigger takes `ComponentProps` incl. `data-e2e`
  - Replaces every native `<select>`: expense form category, product category, both recurring forms (interval, category), limit form category, period range year
  - Tokens only, `lucide-react` icons, keyboard + typeahead from Radix
- Tests: jsdom shims in `__tests__/setup.ts`, `pickOption` helper; e2e opens trigger then clicks `option` role
