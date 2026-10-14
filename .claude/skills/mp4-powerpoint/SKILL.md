---
name: mp4-powerpoint
description: Animated explainer video (MP4 slide deck, particle art, code panels) for LinkedIn/social, 1080x1350 muted autoplay. Use when dev asks for "linkedin video", "explainer video", "animated presentation/slides for LinkedIn", "mp4 presentation", "nagranie/prezentacja na LinkedIn", "filmik", or invokes /mp4-powerpoint.
---

# mp4-powerpoint

Topic -> 7-9 animated slides -> deterministic frame capture -> H.264 MP4. Optional PDF carousel. Assets: `assets/template.html` (engine + styles + example SLIDES config), `assets/capture.mjs` (Playwright + ffmpeg).

## 1. Gate

Ask only missing. Defaults:

- Topic: required.
- Language: EN (PL on request; PL text -> `/polaczek`).
- Output: repo root `<slug>.mp4`.
- Format: video only (PDF carousel on request).
- Brand: `BRAND` in template (`polubinski.dev`).

## 2. Facts

1. Every tech claim, version, flag, default -> verify on official docs (WebFetch) before slide.
2. Unverifiable -> drop. No guessed numbers.
3. Version pills only when verified (e.g. `pnpm 10.12.1+`).
4. Keep source URLs for report.

## 3. Story

7-9 slides, 4.6-5.8s each (~45-50s total). One idea per slide. Arc:

| # | Beat | Kind | `art.layout` |
| - | ---- | ---- | ------------ |
| 1 | hook (question) | text + canvas labels | `scatter` |
| 2 | problem | `cards` + small `code` | `chaos` |
| 3 | concept | `code` + `hub` | `hub` |
| 4 | usage | `code` + `hub` + `nodes` | `flows` |
| 5 | variant/advanced | `code` + 2 `hub` | `twoHubs` |
| 6 | payoff | `code` diff + `note` | `wave` |
| 7 | edge/safety | `code` + `cmd` + morph token | `stream` |
| 8 | pro tips | `tips` (3 cards) | `field` |
| 9 | CTA | `mark` + `big` brand | `ring` |

Particles must tell story: chaos = mess, hub = single source, flows = fan-out, wave = change propagates, ring = closure. Title <= ~6 words, `<em>` on key word. Sub = one mono caps line. CTA = question + comment/share/follow tags.

## 4. Style spec (in template, keep)

- Canvas 1080x1350 (4:5 portrait), side padding 72px, content width 936px.
- Tokens `:root`: bg `#050507`, ink `#FFF`, muted `#8A87A0`, violet `#7C5CFF`, soft `#B48CFF`, gold `#E8C547`, teal `#4FD1C5`, rose `#FF6B8A`.
- Fonts (Google, `display=block`): Sora 800 headings, Inter body, JetBrains Mono code/kicker/sub; `font-variant-ligatures:none` on code.
- Chrome: brand dot + name top-left (50px), `NN/NN` counter top-right, 5px violet->gold progress bar top, ghost slide number (520px outline) behind copy.
- Copy block top 150px: kicker `— NN / word`, h1 84px/1.04, sub gold mono caps 24px, pills (tags, colored dot).
- Layout: text top ~45% (150-520px), art + code bottom (530-1300px). Bottom never empty, never overlapping copy.
- Phone mins: h1 76-88px, code >= 26px (default 28, big 31), notes 27-28px, pills 20px.
- Code panel near-opaque bg -> particles behind never hurt reading. Highlight = violet tint + left bar (`hl`).

## 5. Build

1. Work dir = session scratchpad `<scratch>/<slug>/`. Copy `assets/template.html` -> `index.html`, `assets/capture.mjs`.
2. `npm init -y && npm i playwright ffmpeg-static ffprobe-static` (+ `npx playwright install chromium` if missing).
3. Edit only CONFIG block: `BRAND`, `SLIDES` array. Schema documented in template header comment (slide fields, element types, layouts + params).
4. Element `in` = appear time (s, slide-local). Code lines auto-stagger `.15s`; `stagger: 0` = lines appear with panel. `hl` = highlight time. `diff: '+'|'-'`. Morph: `<span data-morph="2.0">from|to</span>`.
5. Align art params with elements: `hub` layout `x,y` = hub el center; `flows.xs` = `nodes.xs`; `twoHubs.a/b` = hub centers; `ring` = `mark` center.
6. Engine rules (never break): `window.renderAt(tMs)` pure fn of t; all state from t (no Date/Math.random/rAF in capture, seeded `rng(42)`, scramble via `hash(i, frame)`); `?capture=1` disables rAF loop; particles morph prev->cur layout with easing first ~1.2s of slide.
7. Need new layout -> add fn to `LAYOUTS` `(p, t, lt, art) => {x,y,c,s,a}`, deterministic.

## 6. QA loop (before full render)

1. `node capture.mjs index.html out.mp4 --stills` -> `stills/slide-N.png` (72% of each slide).
2. Read every PNG. Check: overlap text/elements, clipping, off-canvas, h1 wrap (3+ lines = too long), empty-space balance (no dead bottom third), readability at phone size, counter/brand correct.
3. Transitions: `node capture.mjs index.html x --at 10200,33000` -> `at/t<ms>.png`. Pick ms near slide starts + morph times.
4. Fix, repeat until clean.

## 7. Render + proof

1. `node capture.mjs index.html <repo>/<slug>.mp4` -> frames every 33.333ms -> libx264 yuv420p crf 18 r30 `+faststart`, no audio.
2. Probe: `node -e "console.log(require('ffprobe-static').path)"` then `<ffprobe> -v error -show_entries stream=codec_name,pix_fmt,width,height,r_frame_rate:format=duration -of default=nw=1 <mp4>`. Expect h264, yuv420p, 1080x1350, 30/1.
3. Final proof: extract frame per slide from MP4: `<ffmpeg> -ss <sec> -i <mp4> -frames:v 1 proof/slide-N.png`; Read them.
4. Only MP4 goes to target path. HTML, frames, stills stay in scratchpad.

## 8. PDF carousel (optional)

Same 1080x1350. From stills: Playwright page with one `<img>` per page, `page.pdf({ width: '1080px', height: '1350px', printBackground: true })`. Or `img2pdf`/ImageMagick if present. Output `<slug>.pdf` next to MP4.

## 9. Pitfalls (hit before)

- Never Playwright `recordVideo` -> blurry VP8, timing drift. Always frame stepping.
- Canvas text needs explicit `document.fonts.load(...)`; `fonts.ready` alone not enough -> fallback font in labels. Await `window.ready` before first frame.
- Element with base `transform` (`.cmd` centered via `translateX(-50%)`) -> entry anim must keep it, else jumps left. Same for any new centered el.
- Particle transition must eval prev layout at `DUR[k-1] + lt` -> no jump at slide boundary.
- Fade-out (.35s) + fade-in (.6s) -> brief dark gap is intended; keep copy translate small (34px in / 18px out) -> no layout shift feel.
- Long h1 wraps to 3 lines -> pushes sub/tags into art zone. Shorten title, not font.
- JetBrains Mono ligatures turn `->`, `!=`, `www` into glyphs -> `font-variant-ligatures:none`.
- Stills at slide start show half-faded els -> stills sample 72% of slide.
- yuv420p needs even dims; 1080x1350 OK.
- LinkedIn autoplays muted -> all info burned into slides, no voiceover reliance.

## 10. Rules

- Never commit media (MP4/PDF/PNG) -> `rules/git.md` 3. Leave MP4 untracked.
- Session end: one decision entry (`rules/general.md` 3).
- Report: output path, ffprobe line, slide list, verified sources, proof frames.
