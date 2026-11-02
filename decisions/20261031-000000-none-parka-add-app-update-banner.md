---
ticket: none
scope: parka/app-update
summary: Add banner offering reload when a newer app version is deployed
why: Open tabs and PWAs run stale bundles for weeks; users need a prompt to reload after a deploy
date: 2026-10-31
tags: [pwa, deploy, banner]
---

- Version = `package.json` version + short `GITHUB_SHA` (`0.0.1+abcdef1`), so every deploy changes it; local builds get `+dev`
  - Injected as `import.meta.env.PUBLIC_PARKA_APP_VERSION` via `vite.define` in `astro.config.mjs`
  - `GITHUB_SHA` declared in `turbo.json` for `build` and `deploy` (strict env mode would drop it)
- Prerendered `/version.json` emitted at build; `no-cache` in `public/_headers`
- `shared/app-update`: fetch `no-store`, compare with running bundle version, no localStorage
  - Re-check every 10 min and on tab visible; a dismissed banner returns on next check
  - Fetch or parse failure stays silent
- Banner floats over the shell (no layout shift), Reload button calls `location.reload()`
- Push notifications for releases dropped by design; banner reaches open tabs only
