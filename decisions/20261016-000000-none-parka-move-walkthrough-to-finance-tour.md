---
ticket: none
scope: parka
summary: Move home walkthrough into a one-time finance tour for new users
why: New users met a 4-step intro before signing up; the tour now explains real finance features where they are used
date: 2026-10-16
---

- Home is a one-screen landing (value line, 3 feature chips, sign-up, sign-in); walkthrough removed from it
- New `finance-tour` module mounted in app shell; opens as URL modal `?modal=tour` when outcome is due
  - 6 steps: summary, receipt scan, categories, limits, recurring, reports
  - Illustrations built from real UI pieces (`Card`, `ProgressBar`, `CategoryIcon`) and tokens; dark mode, 320px ok
  - Skip, X, Esc and Back all end it as `skipped`; last step ends as `completed`; optimistic close, error toast with retry
  - Fails closed: no or bad answer keeps it hidden
- Footer: two equal buttons, `Pomiń | Dalej` on step 1, `Wstecz | Dalej` after; arrows page steps
- Shared walkthrough: `illustration` instead of `icon`, back action, no localStorage (caller persists outcome)
- Backend: `finance_tours` table (RLS) with `expires_at`; `GET/PUT /api/finance-tour/`
  - Outcome valid 30 days (`server/domain/finance-tour.ts`); expired = due again; each finish extends it
  - Existing accounts backfilled as `skipped`
- Tests: unit, module (MSW), domain, real-backend e2e (tour once per account, REST validity + extension)
