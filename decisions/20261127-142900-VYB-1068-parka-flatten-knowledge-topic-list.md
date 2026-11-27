---
ticket: VYB-1068
scope: parka/knowledge
summary: Flatten knowledge topic list, no category or catalog headers
why: Category plus catalog headings above the list duplicated the picked catalog and made the module hard to read.
date: 2026-11-27
tags: [ux, knowledge]
---

- Main list shows only topics of the picked catalog, no category section, no catalog title above the list
- Add-topic "+" moved to the Tematy card header, same label, still adds to the picked catalog
- Backlog holds many catalogs: simple heading per catalog, like finance groups, no category level
- Removed unused groupTopics helper and its test, dropped knowledge:category e2e id
- Unit tests cover flat main list and grouped backlog, video evidence at 390 and 1280 width
