# 0016 - revert unwanted visual changes from token pass

```json
{
  "models": ["claude-sonnet-5-5"],
  "status": "done"
}
```

Cause: 0015 added a dark palette under `@media (prefers-color-scheme: dark)`. Dark OS = whole app recolored. Playwright runs light, so e2e never saw it.

- Dark palette now opt-in: `:root[data-theme='dark']`. Never follows OS. No toggle yet.
- Light tokens restored to exact former values: `--line` 0.05, `--hover-soft` 0.03 (expense rows), `--track-strong` 0.15 (toggle), `--danger-strong` #e11d48 (rose-600: trend up, progress bar), `--danger-faint` #fff1f2 (rose-50 hover), `text-micro` 10px / `text-caption` 11px in rem (chart labels, quick actions; were `text-xs` 12px), bar min height 3px.
- `LoadingBanner` now absolute overlay on a `relative` root - no layout space (was +20px at top of both screens).
- Verified: screenshots light vs OS dark identical (4 pages), lint, vitest (20), full Playwright 31/31 incl. real backend. E2E serves the built `dist` - run `pnpm build` first.

Left as intentional new UI (asked for in 0015): skeleton on first load, `ErrorState` on error, toasts, Radix dialog. Not diffed pixel-by-pixel vs `c607e74`.
