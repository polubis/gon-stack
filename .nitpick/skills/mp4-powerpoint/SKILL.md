---
name: mp4-powerpoint
description: Code-first explainer video (MP4 slide deck, code panels, minimal purposeful animation) for LinkedIn/social, 1080x1350 muted autoplay, polubinski.dev branding. Use when dev asks for "linkedin video", "explainer video", "animated presentation/slides for LinkedIn", "mp4 presentation", "nagranie/prezentacja na LinkedIn", "filmik", or invokes /mp4-powerpoint.
---

# mp4-powerpoint

Topic -> facts -> **skeleton (approved)** -> slides -> deterministic frame capture -> H.264 MP4. Optional PDF carousel.

Assets:

- `assets/skeleton.md` - skeleton template (plan before slides)
- `assets/template.html` - engine + styles + example SLIDES config
- `assets/capture.mjs` - Playwright + ffmpeg
- `assets/logo.svg`, `assets/fonts/Aspekta-*.woff2` - polubinski.dev brand

## 1. Gate

Ask only missing. Defaults:

- Topic: required.
- Language: EN (PL on request; PL text -> `/polaczek`).
- Output: repo `.evidences/<slug>.mp4` (gitignored).
- Format: video only (PDF carousel on request).
- Brand: polubinski.dev (logo + site theme). Never other brand.

## 2. Facts

1. Every tech claim, version, flag, default -> verify in source repo or official docs (WebFetch).
2. Unverifiable -> drop. No guessed numbers.
3. Code on slides = real code (repo files, docs examples). Trimmed ok, invented API never. Illustrative-only snippet -> label it (`example`) in panel header.
4. Keep source paths/URLs for report.

## 3. Skeleton first (no slides before it)

1. Copy `assets/skeleton.md` -> `<work>/skeleton.md`, fill table: per slide message, proof, title, sub, visual, dur.
2. Show skeleton to dev, wait for OK. Skip wait only when dev explicitly asked for direct render; then still write it and include it in report.
3. Only after OK -> translate rows 1:1 into `SLIDES` config. Changes later -> update skeleton first.

Story: 6-9 slides, ~45-60s. One idea per slide. Typical arc: hook (concrete problem) -> concept -> how it works (1-3 slides) -> integration/usage -> extras -> CTA. Arc serves content, not fixed beats.

## 4. Content rules (priority order)

1. **Proof first.** Every content slide centers on code/terminal/example panel proving the title. Panel = largest element, right under copy.
2. **Text minimal, each fact once.** Title states claim. Code proves it. Sub only if it adds info neither title nor code shows. Note only if it adds info. No tags/pills, no ghost numbers, no `NN /` in kicker (counter shows position).
3. **Hierarchy.** Title (76px, ink, `<em>` green on 1 key word) > code (30px) > sub/note (30-32px muted) > kicker (22px mono green, optional section word). Title <= 7 words, max 2 lines. Sub <= 12 words, 1 line preferred.
4. **Visuals secondary.** Art only when it explains something code cannot (fan-out, ordered flow, pass/fail). Skeleton row must name what it explains, else `none`. Each art layout max once per deck. Ambient star field always on, not counted.
5. **Motion secondary.** Fade+rise entries, line stagger, highlight `hl` on the lines that matter, morph only for real value change (e.g. output appearing). No decorative motion.
6. **Readability.** Code <= 10 lines, <= 46 chars/line at 30px (<= 51 at 28, min 26px). Reading time: dur ~= 3 + 0.35 x code lines (s), 5-7.5s.

## 5. Style spec (in template, keep)

- Canvas 1080x1350 (4:5), side padding 72px, content width 936px.
- Theme = polubinski.dev tokens: bg `#000100`, ink `#d7d8d9`, muted `#888`, green `#0dd97d` / `#0bad67`, panel `#070908`, line `rgba(255,255,255,.1)`. Code-only accents: string `#e8d9a0`, comment `#6d716f`, error `#ff7b72`.
- Fonts: Aspekta (site font, local woff2) 500 titles / 400 body; JetBrains Mono code with `font-variant-ligatures:none`.
- Chrome: logo (60px) + `polubinski.dev` top-left, `NN/NN` counter top-right, 4px green progress bar top. Green blinking `_` cursor after title (site motif) on hook + CTA only (`cursor: true`).
- Code panel: header with file path or `terminal`, near-opaque bg, highlight = green tint + left bar.
- CTA: logo big + `glow`, question title, brand, repo link.

## 6. Build

1. Work dir = session scratchpad `<scratch>/<slug>/`. Copy `assets/template.html` -> `index.html`, plus `capture.mjs`, `logo.svg`, `fonts/`.
2. `npm init -y && npm i playwright ffmpeg-static ffprobe-static` (+ `npx playwright install chromium` if missing).
3. Edit only CONFIG block: `SLIDES` from skeleton. Schema in template header comment.
4. Element `in` = appear time (s, slide-local). Code lines auto-stagger `.15s`; `stagger: 0` = all at once. `hl` = highlight time. `diff: '+'|'-'`. Morph: `<span data-morph="2.0">from|to</span>`. Nodes `on`/`bad` + `onAt`/`badAt` = state change.
5. Align art with elements: `flow.from` = source center, `flow.to` = node centers (`nodes.xs`, `y`); `pipe.points` = node centers; `glow` = logo center.
6. Engine rules (never break): `window.renderAt(tMs)` pure fn of t; all state from t (no Date/Math.random/rAF in capture, seeded `rng`, scramble via `hash(i, frame)`); `?capture=1` disables rAF loop.
7. New art layout only when skeleton needs new meaning: add fn to `ART` `(A, lt, v) => draw`, deterministic.

## 7. QA loop (before full render)

1. `node capture.mjs index.html out.mp4 --stills` -> `stills/slide-N.png` (80% of each slide).
2. Read every PNG. Check: duplicated info (title/sub/code/note), hierarchy, code readable at phone size, overlap, clipping, h1 > 2 lines, dead space, logo/counter correct.
3. Transitions + key moments: `node capture.mjs index.html x --at 7200,15000` -> `at/t<ms>.png`.
4. Fix, repeat until clean.

## 8. Render + proof

1. `node capture.mjs index.html <repo>/.evidences/<slug>.mp4` -> frames every 33.333ms -> libx264 yuv420p crf 18 r30 `+faststart`, no audio.
2. Probe: `node -e "console.log(require('ffprobe-static').path)"` then `<ffprobe> -v error -show_entries stream=codec_name,pix_fmt,width,height,r_frame_rate:format=duration -of default=nw=1 <mp4>`. Expect h264, yuv420p, 1080x1350, 30/1.
3. Final proof: extract frame per slide from MP4: `<ffmpeg> -ss <sec> -i <mp4> -frames:v 1 proof/slide-N.png`; Read them.
4. Only MP4 goes to target path. HTML, frames, stills, skeleton stay in scratchpad (skeleton content goes into report).

## 9. PDF carousel (optional)

Same 1080x1350. From stills: Playwright page with one `<img>` per page, `page.pdf({ width: '1080px', height: '1350px', printBackground: true })`. Output `<slug>.pdf` next to MP4.

## 10. Pitfalls (hit before)

- Never Playwright `recordVideo` -> blurry VP8, timing drift. Always frame stepping.
- Fonts + logo must load before first frame: `window.ready` awaits `document.fonts.load(...)` + images. Missing `fonts/` or `logo.svg` next to `index.html` -> fallback font / broken logo.
- Centered el with base `transform` (`.node` `translateX(-50%)`) -> entry anim keeps it. Same for any new centered el.
- Decorative particles everywhere = noise, distracts from code (old version). Art only per skeleton.
- Title + sub + tags + note repeating same fact = clutter. Run duplication check in skeleton.
- Long h1 wraps to 3 lines -> shorten title, not font.
- JetBrains Mono ligatures turn `->`, `!=`, `=>` into glyphs -> `font-variant-ligatures:none`.
- Stills at slide start show half-faded els -> stills sample 80% of slide.
- LinkedIn autoplays muted -> all info burned into slides.

## 11. Rules

- Never commit media (MP4/PDF/PNG) -> `rules/git.md` 3.
- Session end: one decision entry (`rules/general.md` 3).
- Report: skeleton table, output path, ffprobe line, verified sources, proof frames.
