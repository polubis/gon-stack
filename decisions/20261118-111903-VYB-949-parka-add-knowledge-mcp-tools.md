---
ticket: VYB-949
scope: parka/knowledge
summary: Add MCP tools for the whole knowledge module
why: Time and finance were reachable by AI over MCP, knowledge was not; an agent could not build or study a course the user keeps in the app.
date: 2026-11-18
tags: [mcp, knowledge, supabase]
---

- 22 tools over categories, catalogs, tags, topics, reels and reel progress; lists and get are read-only, every delete needs confirm true.
- Same path as the other tools: gateway calls mcp_* SQL functions with the raw token, the database resolves the owner and filters by it.
- Functions taking a user id (json helpers, tag sync) are revoked from anon; only token functions are granted.
- Name clash and used category become PT400, so the model reads a clear refusal instead of a blind 500.
- Deleting a catalog, topic or reel returns the media paths and the gateway removes the files; new anon delete policy on knowledge-media, owner via x-mcp-token.
- Reel pictures and clips are not uploaded over MCP, only mediaKind is shown; the ticket upload flow is task-specific, so it is a follow-up.
- New data domain knowledge: write tools announce it, the screen refreshes quietly through a new refresh handler sharing apply logic with load.
- defineTool takes a domain, default time, so existing tools behave as before.
- Regenerated db-schema keeps time_tasks.key optional on insert, as before; a trigger fills it.
