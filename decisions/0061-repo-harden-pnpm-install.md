---
ticket: none
scope: repo
summary: Pnpm 11 install hardening
why: Make installs fail closed on supply-chain and version drift, using settings pnpm 11 actually honors
date: 2026-09-30
---

- Removed `.npmrc`: pnpm 11 reads only auth/registry from it, all other settings there were ignored.
- Added to `pnpm-workspace.yaml`: `engineStrict`, `saveExact`, `linkWorkspacePackages: false`, `pmOnFail: error`, `trustPolicy: no-downgrade` with `trustPolicyExclude` for `chokidar@4.0.3` and `semver@6.3.1`
  - (older releases without provenance, judged false positives, not verified against publish history).
- `pnpm peers check` exits 1: `tsconfck@3.1.6` wants TypeScript `^5`, installed 6.0.3 (`packages/react-kit`), left open.
- `strictPeerDependencies` did not block in tests, so peer gate for CI is `pnpm peers check`.
- Audit plan (lockfile refresh, overrides, Astro/Cloudflare bumps) not started.
