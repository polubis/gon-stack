---
ticket: VYB-936
scope: parka/knowledge
summary: Rebuild knowledge module on real backend with reels
why: Old module was a mock presentation layer; goal is a full feature with backend, RLS, reels and demo course in one PR
date: 2026-11-18
tags: [knowledge, ui, supabase, rls]
---

- One migration with categories, catalogs, tags, topics, topic_tags, reels and reel_progress; composite (user_id, id) keys, owner-only RLS, anon has no grants
- Category delete is restrict (409); catalog, topic and reel delete cascades to progress; tag delete only unlabels; progress is one row per finished reel
- Topic has study_day with from/to/scope filters; reel media lives in private knowledge-media bucket with owner-only RLS, upload, delete and signed read endpoints
- Endpoints under /api/knowledge/ with zod contracts in own file; overview filters narrow topics only, summary always covers all so the brain stays stable
- Idempotent POST /api/knowledge/demo creates course "Nauka Supabase": 10 lessons, 55 reels (no DB seed in parka)
- Frontend rewritten from scratch on real API and mirrors the time module: period navigation, backlog, filters, sort, optimistic CRUD with rollback
- Brain widget: hero progress counts all nodes like the stats card, cortex vs cerebellum+brainstem split, Ruszone / Opanowane / Nieruszone counters
- Reel viewer: swipe left/right between reels, swipe down for next lesson, keyboard and buttons, motion-reduce honoured
- Markdown renderer in-house, no raw HTML, no new dependency; link targets parsed with URL and only http, https, mailto kept
- Generated db-schema.ts keeps time_tasks.key optional by hand, db:gen-types makes it required and breaks time code
- No MCP integration in this iteration, per task
- Tests: pgTAP, vitest with msw, Playwright real-backend e2e; video proof in task attachments
- Known gaps: vertical swipe on long reels on touch may scroll; lesson changes stay in viewer state not URL; brain area mapping derived from category order
