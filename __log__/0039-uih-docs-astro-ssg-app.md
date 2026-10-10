# 0039 - uih-docs static docs app

```json
{
  "status": "done"
}
```

Added `apps/uih-docs`: pure SSG Astro app (React + Tailwind, no adapter) documenting `@repo/uih`. Pages: overview, Button (usage, variants, disabled).

Dev refresh: Vite aliases `@repo/uih/button` and `@repo/uih/theme` to `packages/uih/src`, so TS/CSS edits in the library hot-reload in `astro dev` with no package rebuild. `tsconfig` paths mirror the alias for `astro check`.

Reason: show documented uih components with a fast edit loop.
