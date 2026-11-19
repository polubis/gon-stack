---
ticket: VYB-954
scope: parka/navigation
summary: Bottom nav floats over page, no empty band behind add menu
why: With the nav slid away its empty slot still showed the shell background and cut the page off above it.
date: 2026-11-19
---

- Bottom nav slot is now absolute over the page bottom; the scroll area runs to the screen edge with bottom padding of the nav height, so content still ends above the nav at rest.
- Dropped the page bottom mask fade (frosted nav blurs the content under it instead).
- E2E checks the page reaches the screen bottom with the menu open; old fade test replaced.
