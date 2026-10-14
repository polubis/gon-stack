---
ticket: none
scope: claude
summary: Redesign mp4-powerpoint skill, add Nitpick LinkedIn videos
why: Videos must be code-first, skeleton-planned, branded as polubinski.dev
date: 2026-10-14
tags: [linkedin, video, skill, nitpick]
---

- `mp4-powerpoint` skill: skeleton first (`assets/skeleton.md`), dev OK before slides
  - Content rules: proof (real code) first, each fact once, no tags/ghost numbers, title > code > sub hierarchy
  - Visuals secondary: art only when it explains (`flow`, `pipe`, `glow`), each layout max once, ambient stars
- Template rebuilt on polubinski.dev theme: `#000100` bg, `#d7d8d9` ink, `#0dd97d` green, Aspekta font, logo, `_` cursor
  - Code panels with file header, per-node `onAt` timing for pipelines; assets `logo.svg`, `fonts/Aspekta-*.woff2`
- Videos in `.evidences/` (gitignored): `nitpick-ai-rules-that-check-themselves.mp4` (v1), `-v2.mp4` (new skill, 8 slides, 53.5s)
- Facts: `packages/nitpick` sources, `.husky/commit-msg`, Node type stripping default since v23.6/v22.18 (nodejs.org)
