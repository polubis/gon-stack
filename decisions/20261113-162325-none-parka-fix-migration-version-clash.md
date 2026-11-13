---
ticket: none
scope: parka/supabase
summary: Rename time_recurring_daily migration to unique version
why: Two migrations shared version 20261113090000, so the second failed on schema_migrations_pkey during deploy.
date: 2026-11-13
tags: [parka, supabase, migrations]
---

- Supabase keys `schema_migrations` by timestamp prefix only, so equal prefixes collide even with different names
- `20261113090000_time_recurring_daily.sql` renamed to `20261113090100_time_recurring_daily.sql`, content unchanged
- `mcp_upload_tickets` keeps `20261113090000`, it was already applied
- Verified no duplicate versions left in `apps/parka/supabase/migrations`
