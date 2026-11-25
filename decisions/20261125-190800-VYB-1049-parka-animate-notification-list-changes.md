---
ticket: VYB-1049
scope: parka/notifications
summary: Animate update and delete of notification rows
why: UX rule 19 asks for a visible transition on every changed item, notification list jumped instead.
date: 2026-11-25
tags: [notifications, ux]
---

- list: shared `useListChanges` in `Router` feeds `NotificationRow` a `phase`; mark-read flashes, delete fades out and neighbours glide
- empty state waits until the leaving row is gone, so last delete animates too
- row uses shared `changeProps`, inert while leaving, `motion-reduce` disables all
- chose shared hook to match access-tokens, categories, time and knowledge lists
- tests: existing unit suite stays green (jsdom counts as reduced motion, instant)
- evidence: Playwright recordings of mark-read and delete on 8 viewports 320-1920 against stubbed notifications API
