---
ticket: VYB-941
scope: parka/knowledge
summary: Add knowledge module schema, RLS and backend API
why: Slice 1 of VYB-936; UI, brain widget and upload slices build on this schema and API contract
date: 2026-11-17
tags: [parka, supabase, rls, api]
---

- One migration 20261117090000_knowledge.sql: categories, catalogs, tags, topics, topic_tags, reels, reel_progress
- Composite (user_id, id) keys and foreign keys: a row cannot reference another owner's data; RLS owner-only, anon has no grants
- Category delete is restrict (409 like the time module); catalog, topic, reel delete cascades down to progress; tag delete only unlabels
- Progress is one row per finished reel, removing it means not done; topic state (untouched, started, done) is derived, never stored
- Reel = Markdown 1-8000 chars; media columns left to slice 4 (VYB-944), which adds Storage and a column or table for them
- Contract in shared/server-contracts/schemas/knowledge.ts, own file so open PRs 140-142 (general.ts, time.ts, routes.ts) do not conflict
- Endpoints under /api/knowledge/: GET overview, POST categories|catalogs|tags|topics|reels, PUT+DELETE <kind>/[id], GET topics/[id] (topic + reels), PUT progress
- Overview GET filters (q, categoryId, catalogId, tagId, progress, sort) narrow topics only; summary always covers all topics so the brain stays stable (VYB-943)
- Order is position then creation; reorder = PUT with a new position, client picks the numbers
- Duplicate category or tag name answers 409 via explicit 23505 check; fromSupabaseError still maps the rest
- routes.ts helpers not added: slice 2 (VYB-942) adds them with the integration layer; no MCP, no UI by design
- Generated db-schema.ts kept the old optional time_tasks.key (generator made it required, which broke existing code)
- Tests: pgTAP knowledge.test.sql (20), procedure tests with mocked client, filter and summary unit tests; embed shape checked on real local Supabase
