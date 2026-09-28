# 0014 - turbo deploy passThroughEnv for Cloudflare credentials

```json
{
  "status": "done"
}
```

Added `passThroughEnv` on the root `deploy` task in `turbo.json` so
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` reach deploy scripts when
Turbo runs the task, instead of being stripped by the task runner env filter.

Reason: deploy needs Cloudflare credentials in CI and local deploy flows;
without passthrough, Turbo can hide vars that are not listed in `globalEnv`.
