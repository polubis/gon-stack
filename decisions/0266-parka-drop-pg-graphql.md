---
ticket: none
scope: parka
summary: Drop unused pg_graphql extension
why: App uses REST only; extension wastes idle memory on free tier
date: 2026-10-30
tags: [supabase, migration, memory]
---

- Migration `20261030090000_drop_pg_graphql.sql`: `drop extension if exists pg_graphql`
  - No cascade needed, nothing depends on it
  - `config.toml` `[api] schemas` aligned: `graphql_public` removed
  - Deploy runs `db push` only
