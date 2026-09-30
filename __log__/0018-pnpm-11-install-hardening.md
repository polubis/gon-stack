# 0018 - pnpm 11 install hardening

```json
{
  "status": "done"
}
```

Removed `.npmrc`: pnpm 11 reads only auth/registry from it, all other settings there were ignored. Added to `pnpm-workspace.yaml`: `engineStrict`, `saveExact`, `linkWorkspacePackages: false`, `pmOnFail: error`, `trustPolicy: no-downgrade` with `trustPolicyExclude` for `chokidar@4.0.3` and `semver@6.3.1` (older releases without provenance, judged false positives, not verified against publish history).

Verified on a repo copy: frozen install, `pmOnFail`, `saveExact`, `check-types`, `test` pass; `build` not run. `pnpm peers check` exits 1: `tsconfck@3.1.6` wants TypeScript `^5`, installed 6.0.3 (`packages/react-kit`), left open. `strictPeerDependencies` did not block in tests, so peer gate for CI is `pnpm peers check`. Audit plan (lockfile refresh, overrides, Astro/Cloudflare bumps) not started.

Reason: make installs fail closed on supply-chain and version drift, using settings pnpm 11 actually honors.
