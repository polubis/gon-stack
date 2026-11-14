---
ticket: none
scope: repo
summary: Add repo ESLint presets for tests, source and Supabase rules
why: Test, barrel, styling, a11y and Supabase rules lived only in prose; ESLint now fails the build on each, so agents and humans get the same instant feedback.
date: 2026-11-14
tags: [eslint, testing, conventions, lint]
---

- New `@repo/eslint-config` presets `testing`, `conventions`, `supabase`, `exhaustive`, plus own plugin `plugin.js` (`repo/*` rules, no new runtime deps)
- New devDeps `eslint-plugin-testing-library`, `eslint-plugin-jsx-a11y` (catalog, `pnpm audit:check` 0); `eslint-plugin-vitest` skipped, last release 2024 vs vitest 4
- Unit: fetch stubs, `data-e2e`, `.only`/`.skip`/`x*`, queries destructured from `render()`, test-id/container/node access, debug, un-awaited queries and events
- Own rules: `test-title` (Gherkin, max 100, duplicates), `expect-expect` (`get*`/`find*` count as implicit asserts), `msw-lifecycle`
- E2E: raw Playwright `test` import, raw `locator`/`getByText`/`getByLabel`/`getByPlaceholder`/`getByTestId` in specs; `getByRole` left allowed on purpose
- Source: `no-barrel`, `no-raw-tailwind` (arbitrary px, raw `z-*`, inline px), `no-raw-internal-server`, domain/core layer imports, jsx-a11y, `switch-exhaustiveness-check` (type-aware: parka lint 10 s to 26 s)
- 101 tests lint real code through the presets; disabling any one rule fails at least one test. Glob bug found by running on the real app: presets use app-relative `src/**`
- Wired in `parka` and `uih-docs` only. Violations if wired elsewhere: kdebek 17, polubinski-dev 49, romantic-app 134, talent-orbit 100, content-maker 3
- Parka: removed two type re-exports from dashboard `models.ts` (6 importers repointed); ratchet lists for `no-node-access` (13 files) and jsx-a11y (14 files) in `eslint.config.js`
- Two parka tests check no outcome: `confirms with a plain toast` (disabled inline) and `tells how much a photo shrank`; a toast assertion failed when tried, so that flow needs a look
- Not covered by ESLint: `.css`/`.astro` tokens, AAA layout, naming "like a user story", piramida, tests-with-every-diff, branch from fresh main
