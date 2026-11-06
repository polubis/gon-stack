---
ticket: none
scope: repo
summary: Block commits and PRs on any dependency vulnerability
why: Known vulnerabilities must never reach main, so pre-commit and PR CI fail on any audit finding
date: 2026-11-06
---

- Added `scripts/audit.mjs` (`pnpm audit:check`): runs `pnpm audit --json`, fails on any severity, prod or dev
  - Fails closed when audit output is unreadable
- Wired into `.husky/pre-commit` and `pr-ci.yml` after install
- New nitpick rule `security-no-vulnerabilities` (A) in `security`
- Fixed 26 existing findings
  - Updated `zod` catalog 4.6.5 -> 4.6.6; transitive bumps via `pnpm update`
  - Overrides where parents pin vulnerable ranges: `sharp`, `undici`, `fast-uri`, `postcss-selector-parser`, `minimatch`
