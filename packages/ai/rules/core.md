# Web dev rules

## General

- Minimalistic code (less characters or complex names then better)

## Style

- No raw `px`. Need it? Why + inline comment
- No direct colors/spacing/z-index/fonts — main stylesheet vars only
- No built-in Tailwind palette. Own palette always

## Testing e2e

- Use `getByE2e` and data-e2e for selectors with convention: `region:selector-name`

## Testing unit/integration

- Always BLACK BOX, never leak implementation details (one exception -> testing generic codebase like libraries)
- Never code in test names methods, property names, ...etc -> test names must reflect behaviors

## React

- Context: `context()` from `@react-kit`
- Arrow fns only: `const fn = () => {}`
- `cn()` + Tailwind from `@react-kit` if performance not important (SPA apps/parts)

## Architecture

- Domain-sliced modular arch always
- Per feature: `presentation`, `core`, `integration`, `configuration`, barrel `index.ts`, `domain`. Skip layers when OK
- `shared` = reusable domains
- No tech buckets (`containers`, `components`, etc.)
- Fully modularized with clear layers (always)
- Focus isolation (instead of tons of files -> prefer single)

## Exports

- Inline only. No bottom export block
- Structure:

```js
// private module code

// public module code (exported one)
```

## Imports

- Absolute imports via `@/` for cross-module paths (e.g. `@/shared/...`, `@/assets/...`, `@/modules/foo` from pages)
- Inside a module, use relative imports between its own layers (e.g. `../domain/models`, `./copy`)
