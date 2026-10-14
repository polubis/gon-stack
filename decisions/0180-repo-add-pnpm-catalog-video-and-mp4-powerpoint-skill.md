---
ticket: none
scope: repo
summary: Add pnpm catalog LinkedIn video and mp4-powerpoint skill
why: Dev wants muted-autoplay LinkedIn post teaching pnpm catalog protocol in author deck style; accepted result turned into reusable skill
date: 2026-10-14
tags: [video, linkedin, pnpm, catalogs, skill]
---

- Output `pnpm-catalog.mp4` at repo root; H.264 yuv420p, 1080x1350, 30 fps, 48.6s, no audio, text burned in
- 9 slides: hook, drift problem, catalog concept, usage, named catalogs, one-line upgrade, publish swap, pro tips, CTA
  - Particle glyph field morphs between per-slide layouts (hub, flows, two hubs, wave grid, rings)
- Deterministic capture: page exposes `renderAt(tMs)`, all state derived from t, no rAF in capture mode
  - Playwright steps t by 33.333ms, PNG per frame, `ffmpeg-static` encodes libx264 crf 18
  - No `recordVideo` (blurry VP8)
- Facts verified on pnpm.io: catalogs since 9.5.0, `catalogMode` + `--save-catalog` since 10.12.1, publish/pack replaces protocol
- Source HTML, capture script, frames, stills kept in session scratchpad; none in repo
- MP4 never committed (git rule 3); existing staged parka changes untouched
- New skill `.claude/skills/mp4-powerpoint/` from accepted video
  - `SKILL.md`: gate, fact check, 9-beat story, style spec, build, stills QA loop, render + ffprobe proof, PDF carousel, pitfalls
  - `assets/template.html`: engine + styles + 9 particle layouts, content in single `SLIDES` config (pnpm deck as example)
  - `assets/capture.mjs`: args `<html> <out.mp4> [--stills] [--at ms,..] [--fps]`, duration from slides
  - Row added to `.claude/CLAUDE.md` skills table
