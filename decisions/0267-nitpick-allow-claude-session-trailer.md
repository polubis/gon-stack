---
ticket: none
scope: nitpick
summary: Allow Claude-Session trailer in commit messages
why: Harness appends it to every commit; rejection caused fix cycles
date: 2026-10-30
tags: [commit-msg, esm]
---

- `rich-commit`: one final `Claude-Session: https://claude.ai/code/session_<id>` line allowed, blank line before optional
  - Other trailers, `Co-authored-by`, refs, credits still rejected
  - Blank-line-in-list ban unchanged
  - `attribution` in `.nitpick/config.ts` stays `''`: allowed, not forced
- `.nitpick/package.json` `{"type":"module"}`: removes MODULE_TYPELESS_PACKAGE_JSON warning
  - Root `type` untouched, no blast radius on root configs
