---
ticket: VYB-963
scope: parka
summary: Add MCP course authoring guide and atomic lesson tool
why: AI authors courses inconsistently and a topic with many reels via separate calls can stop half done. A guide fixes the style, one atomic call fixes the writes.
date: 2026-11-21
tags: [mcp, knowledge, supabase]
---

- get_course_authoring_guide is read-only, returns Markdown from a repo .md (?raw import) plus a note per language (pl, en, de, generic fallback)
- Guide embeds the dev's article as voice reference only, lesson structure comes from the skeleton
- create_knowledge_lesson calls one SQL function mcp_create_knowledge_lesson: topic, tags found or created, reels in order, one transaction so any failure leaves nothing
- Limits 30 reels per call, 8000 characters per reel, validated by zod before the database is touched
- Errors use the existing MCP unwrap mapping (PT400 to readable refusal, others to a fixed message), no raw InternalServer
- Server instructions now tell the model to read the guide first and write lessons through the new tool
- Tests: endpoint tests with a fake gateway, pgtap test for order, tag reuse, rollback and owner isolation
