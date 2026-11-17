---
ticket: VYB-945
scope: repo
summary: Bump next and ignore unfixable picomatch advisory
why: audit:check failed on main and blocked every commit; picomatch has no patched release
date: 2026-11-17
tags: [security, audit]
---

- Bump next 16.4.1 to 16.4.6 (catalog, pins, eslint plugin) to clear two moderate advisories
- picomatch GHSA-fc5q-39xc-vjpf (high, ReDoS) has no fix, 4.0.7 is latest, only dev tooling pulls it
- Dev approved a scoped exception via auditConfig.ignoreGhsas with a comment and recheck date 2026-12-17
- audit.mjs now counts advisories, not metadata, because pnpm keeps ignored ones in metadata counts
- Remove the exception once picomatch ships a patched release
