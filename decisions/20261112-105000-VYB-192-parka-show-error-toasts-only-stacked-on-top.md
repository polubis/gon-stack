---
ticket: VYB-192
scope: parka
summary: Toasts show errors only, stacked at the top
why: A success toast adds noise, the UI already shows the result; errors need to be visible together and calm
date: 2026-11-12
---

- `shared/ui/toast.tsx` renders only `tone: error`; success notices render nothing.
- Toasts portal into one shared top container (`#toast-stack`, aria-live), so mounted toasts stack with close X.
- Calmer look: bordered card, small text, no saturated background; auto-dismiss removed (errors stay until closed).
- Removed `AccountSwitchToast` and the session key (success only); two video-ready toast tests dropped.
- Tests asserting success toasts now assert the visible outcome only; e2e specs adjusted but not run.
- Known limit: a module holds one notice, a new error replaces its previous one; `success` type and `action` are now dead.
