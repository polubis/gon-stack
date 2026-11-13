---
ticket: VYB-290
scope: parka/time
summary: Stable task popup loading, two items then show more
why: Comments and attachments loaded as one short skeleton, then the popup jumped; ticket wants placeholders as tall as content and two items first.
date: 2026-11-13
tags: [parka, time, loading, layout]
---

- Ticket says expense details, but only task details have comments and attachments, so the change targets the task popup
- Comments and attachments skeletons now render two rows as tall as real rows with the same gap, so content replaces them in place
- Both lists show first two items, then Pokaż więcej (n) expands the whole list; hidden when nothing is folded
- Adding a comment or uploading a file expands the list so the new item is visible
- Tests cover fold and expand for comments and attachments
