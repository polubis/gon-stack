---
ticket: VYB-246
scope: nitpick
summary: Output toc can hide rule and reference lists in root doc
why: Root CLAUDE.md should not list rules and references, files still written
date: 2026-11-06
---

- New `toc.rules` and `toc.refs` flags on output, default on, next to `agents` and `skills`
- Hidden lists skip only the root section, rule and reference files are still written
- `.nitpick/config.ts` sets both to false, root CLAUDE.md keeps title and two lines
- Test: hidden lists leave files written, full nitpick suite 349 passing
