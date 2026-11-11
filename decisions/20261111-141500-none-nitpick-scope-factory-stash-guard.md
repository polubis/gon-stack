---
ticket: none
scope: nitpick
summary: Factory stash guard counts only its own named stashes
why: Dev stashes unrelated to factory blocked every run, since guard treated any stash as a task in progress
date: 2026-11-11
tags: [agents, automation]
---

- Guard blocks only on a `factory:*` stash, other stashes belong to the dev and are ignored
- Evidence BEFORE stash named `factory:<task-id>`, popped by that ref, never by position
- Cleanup and verify steps check no `factory:*` stash left instead of an empty list
- New rule: never pop, drop or apply a stash not named `factory:*`
- No code tests: config-only agent text
