# Web dev rules

1. Style: `cn()` + Tailwind from `@react-kit`.
2. React context: `context()` from `@react-kit`.
3. No `px` for styling. Need it? Say why + inline comment.
4. Per feature: `presentation`, `core`, `integration`, `configuration`, barrel `index.ts`, `domain`. Skip layers when OK.
5. Domain-sliced modular arch always.
6. `shared` = reusable domains.
7. No organize by `containers`, `components`, etc. — no technical buckets.
8. JS/TS/React: always `const fn = () => {}`.
9. Inline exports only. No bottom export. Structure:

```js
// private module code

// public module code (exported one)
```

10. Never use directly colors, spacing, ...etc, it should always use variables for that (if it's not existing in Tailwind).
