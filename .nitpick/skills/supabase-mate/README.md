# supabase-mate

Short prompt pack.

## Purpose

Turn requirements into Supabase DB plan with strict approval gates:

1. 2 schema variants (tables + relationships)
2. security/access map per table
3. per-table structure proposal
4. RPC/index/jobs improvements
5. migration split plan + files (only after approval)

## Behavior

- Replies concise, caveman style.
- Stops at each gate and asks approval.
- No final migration files until user confirms + gives destination path.

## Prompt Examples

```text
Use supabase-mate.
Requirements:
- Users create rooms
- Users join room via invite code
- Host can start game
- Track audit events
```

```text
Use supabase-mate.
Project: romantic-app
Destination for migrations: apps/romantic-app/supabase/migrations
Requirements:
- Player profiles
- Match history
- Private notes per user
- Admin moderation actions
```

```text
Use supabase-mate.
Start from Step A only.
Need 2 schema variants with pros/cons for:
- Multi-tenant workspace
- Team members and roles
- Billing events
```

```text
Use supabase-mate.
I already accept schema variant B.
Continue from Step B security map.
```
