# 0038 - @repo/uih headless button skeleton

```json
{
  "status": "done"
}
```

Added `packages/uih` (`@repo/uih`): headless React UI with the first component (`Button.Root`), optional CSS theme, requirements doc, and Vitest tests. Updated `.claude/rules/react.md` with the `data-e2e` typing rule.

Package:

- Subpath exports only (`@repo/uih/button`, `@repo/uih/theme/*.css`); no barrel file. `sideEffects` marks CSS for bundlers.
- `Button.Root`: native `<button>`, `ComponentProps` + `ref`, variants `primary | secondary | ghost | danger`, hooks `data-ds-button` and `data-variant`. No component-level CSS imports.
- Theme: `tokens.css` for shared `--ds-*` defaults; `button.css` in `@layer ds.button` with `:where([data-ds-button])` selectors. Token defaults live in `var(..., fallback)` on the theme rules so ancestors or inline `style={{ '--ds-*': ... }}` can override without touching TS.
- Build: `tsc` to `dist/` plus `copy-theme.mjs` for CSS. `docs/0.general.md` records full library DoD (Parka-first default theme, runtime overrides, future editor app, coverage targets).

Decisions:

- Headless components + optional plain CSS theme instead of Tailwind inside the library (Tailwind stays in apps; uih defines its own tokens, not Tailwind palette/breakpoints).
- CSS layering (`ds` below utilities) documented in README so consumer `className` utilities win without `!important`.
- React rule: do not invent a custom `data-e2e` prop; extend native props via `ComponentProps` so `data-e2e` stays a normal DOM attribute.

Reason: start a shared, tree-shakable design-system package before migrating Parka controls off ad-hoc markup and to grow themes/components incrementally.
