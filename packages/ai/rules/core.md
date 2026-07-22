# Web dev rules

## Style

- `cn()` + Tailwind from `@react-kit`
- No raw `px`. Need it? Why + inline comment
- No direct colors/spacing/z-index/fonts — main stylesheet vars only
- No built-in Tailwind palette. Own palette always

## React

- Context: `context()` from `@react-kit`
- Arrow fns only: `const fn = () => {}`

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
