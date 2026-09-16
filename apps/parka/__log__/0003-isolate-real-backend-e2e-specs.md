# 0003 - isolate real-backend e2e specs from the fast suite

```json
{
  "models": ["claude-sonnet-5"],
  "status": "done"
}
```

`backend.spec.ts` (full real-Supabase flow) started flaking with `Test timeout of 30000ms exceeded` after the dashboard rebuild added `/api/dashboard` round-trips to the dashboard load + month navigation. Root cause: all 31 e2e specs share one `wrangler dev` process; running the real-backend specs (`backend.spec.ts`, `server/__e2e__/rest-endpoints.spec.ts`) concurrently with the other 29 fast/local-mode specs starved their page loads under Playwright's default 8-worker `fullyParallel` scheduling. Confirmed by isolation: the two real-backend specs passed reliably together; they only flaked when the full 31-test batch ran at once.

Rejected fixes: `test.slow()` on the test + a bumped global `expect.timeout` — both loosened budgets without addressing the contention, and `expect.timeout` alone still flaked 2/3 runs. Considered collapsing the small per-feature specs into fewer/bigger tests, but rejected — it fights `rules/general.md`'s testing rules (black-box, story-named, test pyramid) and only reduces concurrency as a side effect rather than fixing the actual bottleneck.

Fix: `apps/parka/playwright.config.ts` now splits into two Playwright projects — `chromium` (the 29 fast specs, unchanged, fully parallel) and `chromium-real-backend` (the two real-backend specs, `fullyParallel: false`, `dependencies: ['chromium']` so it only starts once the fast batch has finished and has the server to itself). No test file or timeout was touched. Verified green across 3 consecutive full-suite runs (~42-44s each).
