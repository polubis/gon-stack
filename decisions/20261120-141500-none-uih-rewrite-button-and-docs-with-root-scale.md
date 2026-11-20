---
ticket: none
scope: uih
summary: New uih docs set, slimmer plan-requirements skill, Parka-style button
why: Old uih had one general doc and a variant button with a flat theme; docs now state hooks, layers, token tiers and theme packs, so the code and the skill that plans from them follow.
date: 2026-11-20
tags: [uih, docs, nitpick]
---

- Docs: `0.general.md` split into `0-vision`, `1.tokens`, `2.component-styles`, `3.architecture`, `4.react`; each has Terms and ID-tagged MUST rules (HDL, TIER, CAS, THM, SHP)
- Skill: `plan-requirements` rewritten short; drops the template file and `deps`, writes `{n}-{kebab-name}.md`, no codebase scan, asks once; `references/template.md` deleted
- Synced with `pnpm nitpick:sync`; `.claude/skills/plan-requirements` now matches `.nitpick/`, no `references/` left
- `@repo/uih` now depends on `@repo/react-kit` (docs DEP-4); no import yet because the simple button needs none
- Button rebuilt to the docs: `data-ds="button"` root hook, axes `appearance=solid`, `color=primary`, `size=s|m|l` (default m); `variant` prop removed
- Size m matches Parka (44px, 14px/600, pill, `#121216`, sheen, raised shadow, lift/sink press); s is 32px, l is 52px
- Layout now `src/{button,themes/aurora}`; `button/index.css` in `ds.components.button`, all selectors `:where()`, no px, reduced motion zeroed once in `tokens.css`
- Aurora pack split into tokens, reset (Tailwind preflight), typography, animations, index; exports are `button`, `button/index.css`, `themes/*`
- Role rule (`data-color=primary`) sits in `tokens.css` under `ds.base` with a `ds-exception` mark; the docs do not name a file for role rules
- Docs app: regex aliases, Outfit font, sizes demo; recording at `.evidences/none/uih-button.webm`
- Scaling: `--ds-scale` (0.875 phone, 0.9375 at 480, 1 at 768, 1.0625 at 1280, 1.125 at 1920) steps in optional `themes/aurora/scale.css` and is applied once as `html` font-size percent; tokens stay plain rem
- Dense areas use a second token `--ds-density` (default 1) on type and space; wrapper needs `data-ds-theme` because tokens compute where declared. Earlier docs claim that a bare `.dense { --ds-scale }` works was wrong, fixed
- Why root scale: the whole page follows device class, consumer overrides with an unlayered `html { font-size }` or skips `scale.css`; rem breakpoints ignore root size so they keep px meaning
- Docs: `1.tokens.md` SCL-1..3, `3.architecture.md` THM-3 file set and 3F; `scale.css` is its own unit (THM-4); added `--ds-leading-*` and `--ds-hairline` tokens
- Docs app: Responsive page lists all 8 breakpoints with device, scale, own or inherited step, a live active-row table, default setup, overrides and a dense demo; Button page has a dense demo
- e2e: `button/__e2e__/scale.spec.ts` (vibe-test, port 4327, serves built uih-docs) opens the Responsive page at all 8 widths, asserts scale, root font, height, font and padding per size, then snapshots one composed board
- Typed selectors per module in `button/__e2e__/selectors.ts`, combined in `src/__e2e__/selectors.ts`; `core/` still skipped (no shared TS yet); win32 baseline only, linux baseline must be generated in CI
