---
ticket: none
scope: repo
summary: Update polubinski-dev meeting calendar link
why: Meeting booking moved to a new Google Calendar appointment page.
date: 2026-11-09
---

- `contactSection.calendarLink` in polubinski-dev constraints points to the new calendar.app.google page
- Single source of truth: every booking CTA reads that field, no other usages to change
- No old or new contact email found in repo, so no email replacement was needed
