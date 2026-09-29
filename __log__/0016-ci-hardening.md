# 0016 - ci hardening: verify gate, pinned actions, conditional migrate

```json
{
  "status": "done"
}
```

`deploy-parka.yml`: `verify` runs hash check + `turbo run lint check-types test --filter=parka...`
(no Playwright install); push trigger limited by `paths`, plus `workflow_dispatch`;
`Migrate DB` runs only when `apps/parka/supabase/migrations` changed (or diff base unknown).
`pr-ci.yml`: same verify step, `permissions: contents: read`.
`pr-ci.yml` also runs `log-check` (full-history checkout). Both workflows run `pnpm format:check` and set `timeout-minutes: 15`. Prettier no longer touches `*.md` (scripts + lint-staged); `format:check` uses `--end-of-line auto` (repo `.prettierrc` is crlf, CI checkout is lf); added `.prettierignore` for generated dirs.
Actions pinned to commit SHAs. Added `.github/dependabot.yml` for `github-actions`.

Reason: broken code reached production and migrated DB; floating tags are a supply-chain risk;
migrations and secrets were used on every push.
