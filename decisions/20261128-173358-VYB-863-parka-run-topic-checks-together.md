---
ticket: VYB-863
scope: parka/knowledge
summary: Overlap topic checks and tag writes in create and update
why: Topic create and update waited for catalog check, tag check, tag add and tag drop one after another, and create dropped tags of a topic that has none.
date: 2026-11-28
---

- Measured with 25 ms round trip: tagged create 175 to 125 ms, untagged create 125 to 100 ms, tagged update 175 to 125 ms
- Catalog and tag checks are reads, now run together; the catalog error still wins when both fail
- A missing tag now fails before the topic is written, not after
- Tag add and tag drop are independent writes, now run together
- New topic skips the tag drop, it has nothing to drop
- Public contract unchanged
- Add knowledge-topic-latency test for round-trip budget and failure behavior
