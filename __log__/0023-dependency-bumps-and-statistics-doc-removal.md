# 0023 - Dependency bumps and statistics doc removal from hashy manifest

```json
{
  "status": "done"
}
```

Bumped `wrangler` -> 4.145.0, `next` and `@next/eslint-plugin-next` -> 16.3.8, `turbo` -> 2.11.6, `pnpm` -> 11.28.3 across apps and root; extended `minimumReleaseAgeExclude` in `pnpm-workspace.yaml` for the new releases. Removed the `statistics` module entry from `hashy.modules.txt`.

Shipped with the statistics-into-dashboard merge (see `apps/parka/__log__/0025`); this root entry covers the files outside `apps/parka` so `log:check` passes.
