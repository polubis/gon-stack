# 0017 - monorepo minor/patch dependency bumps (ncu --target minor)

```json
{
  "status": "done"
}
```

Bumped workspace and root devDependencies with `npm-check-updates` at minor/patch (no pnpm 12 major). Root: `@playwright/test` 1.63.0, commitlint/prettier/turbo/lint-staged patches, `packageManager` pnpm 11.28.2. Apps and shared packages: Astro 7.3.x, `@astrojs/cloudflare` 14.3.x, wrangler 4.143.x, React 19.3, Supabase clients, Next/typescript-eslint 16.3/8.71 where applicable; lockfile refreshed. `pnpm-workspace.yaml`: extended `minimumReleaseAgeExclude` for newly resolved Next and typescript-eslint versions plus wrangler 4.143.0.

After `@playwright/test` 1.63, local e2e needs `pnpm pw:install` once (browser revision 1243); CI workflows still skip e2e. `pnpm audit` dropped slightly (transitive fixes from upstream bumps); remaining advisories are mostly undici/eslint transitives.

Reason: stay on supported patch/minor releases without breaking API majors; reduce audit noise where upstream already shipped fixes.
