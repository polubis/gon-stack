---
ticket: none
scope: parka/dashboard
summary: Skeleton, banner, ErrorState, tokens
why: Dashboard lacked loading, reload and error states and used raw colors/px
date: 2026-09-29
---

- Skeleton on first load, `LoadingBanner` on reload, `load` keeps `$data`.
- Shared `ErrorState` replaces `load-error-fallback.tsx`.
- Theme tokens instead of raw colors/px.
