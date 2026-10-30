---
name: evidence
description: Proof that a change works. Picks cheapest sufficient proof (test, screenshot, video, before/after). Use when dev asks for proof, evidence, "video", "przed i po", "dowod", "pokaz ze dziala", or when worker must show proof of a change.
---

# Evidence

Cheapest enough proof. Script does heavy lift: `evidence.mjs`. Agent writes only tiny scenario.

## Pick level first

| Change | Proof |
| --- | --- |
| Logic bug / regression | Red test on old code, green on new. No video |
| Static look (spacing, color, copy) | `--mode shot`, before/after, marked element |
| New feature | `--mode single`, one video, no BEFORE |
| Time/interaction bug (history, Back, animation) | `--mode before-after`: BEFORE then AFTER, sequential |
| Responsive change | `--mode responsive`: one PNG board, shot per viewport, labeled by width |
| Side-by-side iframe | Only if dev asks explicit. Iframes share session history, break Back |

Non-UI change: tests only.

## Budget

Max 1-3 scenes, ~10 s each. One repair try. Then report with limits.

## Run

Script generic. All repo facts via args or `rules/`/repo docs. Playwright resolved from `--playwright-from` (dir with `@playwright/test`, default cwd).

```
node <skill>/evidence.mjs --scenario <file.mjs> --mode single|before-after|shot|responsive   --url <AFTER> [--before-url <BEFORE>] [--viewport 390x844] [--viewports 320,480,768x900]   --out <name> [--out-dir .evidences] [--timezone UTC] [--locale en-US]   [--backend <probeUrl>] [--serve "cmd|readyUrl|cwd"]... [--worktree <dir>] [--hold-ms 3000]
```

Scenario (scratch dir, never repo) = ES module:

```js
export default async ({ page, mark, unmark, card, hold, log, frame, phase, baseUrl, vw }) => {
  await page.getByRole('button', { name: 'Menu' }).click();
  await mark(page.getByRole('dialog'), 'Modal open', true); // green; false = red
  log('modals', await page.getByRole('dialog').count());   // log values, not screenshots
  await frame('modal');                                    // max 3 key frames
  await hold(2000); await unmark();
};
export const mock = async (ctx) => {}; // optional: ctx.route fallback
```

Script gives: marks, title cards, `recordVideo`, fixed tz/locale, reduced motion, `<out-dir>/<out>.log.txt`, cleanup in `finally` (servers, worktree, git status before/after).

### Responsive

`--viewports` list of `W` or `WxH` (default H 800). Same scenario runs per viewport (`vw` given, `mark` optional). Board `<out>.responsive.png` built with Playwright only (no ffmpeg/sharp). Viewport list: take from `rules/ui.md`, never from skill. Read board: labels + shots must match.

## Backend

Prefer real dev backend; start it per repo docs. Mock only if unreachable and scenario exports `mock`; log `backend=MOCK`, report says so. Else fail. `--backend <url>` probes.

## BEFORE code

`--worktree <dir>` = `git worktree add HEAD`, removed at end. Uncommitted work in main = AFTER. Never edit main tree. No `node_modules` link into worktree (removal deletes main files); install inside it. `{WT}` in `--serve` cmd/cwd = worktree dir. Check main still builds after.

## Verify

Read log + 2-3 key frames. Caption must match logged value. Never claim unseen.

## Rules

- Highlight hold 3-4 s; title card 3 s.
- Personal/sensitive data seen -> stop (`rules/security.md`).
- No `ffmpeg` -> `.webm` only. No fake `.mp4`.
- Pass `--out-dir` = gitignored dir per repo rules. Never commit artifacts.

## Report

- Path (absolute): video / shots / log
- Per scene: BEFORE vs AFTER, logged values
- Limits: mock, dev server vs build, dropped scenes, repair
