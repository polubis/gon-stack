---
ticket: none
scope: parka
summary: Typed notifications with inline diffs and read state
why: Dev wants every expense, category and recurring change reported with what changed, plus mark as read
date: 2026-10-12
tags: [notifications, supabase, backend, diff]
---

- DB migration: `notifications` gets `payload` jsonb, `created_at`, `read_at`; `age_days` dropped
- Seven types, each with its own Zod payload: expense and category created/updated/deleted, recurring accrued
  - Backend flows write them through one shared `recordNotifications` (update/delete read the previous row for before/after)
  - Failure to record never fails the user's change; accrual reports only rows the call really inserted
- No internal endpoint, no service key, no new env vars: flows call the shared function with the request-scoped client (existing owner RLS covers the insert)
  - No public POST route for notifications, so the app API cannot create arbitrary ones
- `PUT /api/notifications/{id}/` and `/read-all/` mark read; nothing is ever deleted or filtered out, read ones stay listed
- `GET /api/notifications/` is cursor paginated (`limit`, `cursor`, newest first, tie-break by id): returns `nextCursor` and server-side `unread` total
  - Mark all updates every unread row server-side, loaded or not
- FE `modules/notifications`: own `presentation/router.tsx` view switch, optimistic mark read/all with toasts and rollback
  - Own `InlineDiff` (word-level LCS, `<del>` strike plus `<ins>` highlight, sr-only cues); no diff library
  - Unread dot and count per screen (server total), bell badge in Settings header (`UnreadLink`)
  - Infinite scroll: IntersectionObserver sentinel with a load more button fallback, card-shaped skeletons, retry on page error, closing line at the end, no duplicates
  - Read notifications stay visible, only restyled ("Przeczytane"); skeleton mimics the card
  - New shared `EmptyState` (icon, title, description) for the no-data screen
- Tests: diff domain, screen flow (pagination, read stays visible, empty, skeleton), notifications e2e (vibe-test), real-backend REST e2e incl. pagination
- Notifications page same width as category screens (`max-w-2xl`, centered)
- Bell with unread badge also in Dashboard header, visible on mobile too
- `LoadingBanner`: infinite sweeping bar until loading ends, reduced motion gives static bar
  - Animation local to the component: inline `style` object plus scoped keyframes, no global CSS
