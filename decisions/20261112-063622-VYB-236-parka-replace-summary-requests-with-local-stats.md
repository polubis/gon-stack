---
ticket: VYB-236
scope: parka/dashboard
summary: Count dashboard statistics client side from all loaded expenses
why: Moving between periods refetched a summary each time; all data is read upfront so navigation is instant and request free.
date: 2026-11-12
tags: [parka, dashboard, loading]
---

- Move summarizeDashboard from server/domain to shared/dashboard-summary, server and client share it
- Dashboard store derives the summary from expenses, categories, limits and period; no summary request
- First load reads expenses, categories, limits, recurring once; period moves never read again
- Expense or recurring change resets the ready flag and reads everything again; limits recount at once
- Leaving the view clears cached reads; next visit starts clean
- Expense list already has no limit, so all years load upfront; year-boundary prefetch is unnecessary
- Kept /api/dashboard endpoint (unused by the app now); removal left for a follow-up
