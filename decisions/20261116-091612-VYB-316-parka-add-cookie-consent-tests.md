---
ticket: VYB-316
scope: parka/shared
summary: Add cookie consent behavior tests
why: Cookie consent had no unit tests, largest untested gap left in parka core/shared.
date: 2026-11-16
---

- Picked `shared/cookies`: zero tests, legal-relevant behavior; other gaps (app-router, dictation, theme, router) already partly covered or thin glue
- One integration test on `CookieConsent` via accessible roles, no msw (no HTTP)
  - Persistence checked by unmount and re-render (reload), not by reading storage
- Covers first visit, accept all, reject, dismiss without saving, per-category save, unsaved toggles dropped, stale version ignored, URL deep link to preferences
